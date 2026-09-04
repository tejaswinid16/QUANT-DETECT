import joblib
import pandas as pd
import pennylane as qml
from pennylane import numpy as np


# ==========================================
# 1. LOAD CLASSICAL MODELS
# ==========================================

logistic_model = joblib.load(
    "logistic_regression_8_features.pkl"
)

svm_model = joblib.load(
    "svm_8_features.pkl"
)

random_forest_model = joblib.load(
    "random_forest_8_features.pkl"
)


# ==========================================
# 2. LOAD VQC MODEL
# ==========================================

vqc_data = joblib.load("vqc_model.pkl")

vqc_weights = vqc_data["weights"]
vqc_scaler = vqc_data["scaler"]
n_qubits = vqc_data["n_qubits"]
feature_names = [
    "mean radius",
    "mean perimeter",
    "mean area",
    "mean concave points",
    "worst radius",
    "worst perimeter",
    "worst area",
    "worst concave points"
]


# ==========================================
# 3. CREATE QUANTUM DEVICE
# ==========================================

dev = qml.device(
    "default.qubit",
    wires=n_qubits
)


@qml.qnode(dev)
def quantum_circuit(features, weights):

    # Encode the 8 features
    for i in range(n_qubits):
        qml.RY(features[i], wires=i)

    # Trainable quantum parameters
    for i in range(n_qubits):
        qml.RY(weights[i], wires=i)

    # Entanglement
    for i in range(n_qubits - 1):
        qml.CNOT(wires=[i, i + 1])

    # Measurement
    return qml.expval(qml.PauliZ(0))


# ==========================================
# 4. VQC PREDICTION FUNCTION
# ==========================================

def vqc_predict(features):

    # Scale features using the scaler
    # saved during VQC training
    features_scaled = vqc_scaler.transform(
        [features]
    )[0]

    output = quantum_circuit(
        features_scaled,
        vqc_weights
    )

    # Convert quantum output (-1 to +1)
    # into a score between 0 and 1
    score = (output + 1) / 2

    return float(score)


# ==========================================
# 5. HYBRID PREDICTION FUNCTION
# ==========================================

def hybrid_predict(features):

    # Create DataFrame with the correct feature names
    features_df = pd.DataFrame(
        [features],
        columns=feature_names
    )

    # Convert to numpy array for VQC
    features_array = np.array(features)
    # --------------------------------------
    # Classical model probabilities
    # --------------------------------------

    lr_probability = logistic_model.predict_proba(
        features_df
    )[0][1]

    svm_probability = svm_model.predict_proba(
        features_df
    )[0][1]

    rf_probability = random_forest_model.predict_proba(
        features_df
    )[0][1]

    # --------------------------------------
    # Quantum score
    # --------------------------------------

    vqc_probability = vqc_predict(
        features_array
    )

    # --------------------------------------
    # Combine all four models
    # --------------------------------------

    hybrid_score = (
        lr_probability
        + svm_probability
        + rf_probability
        + vqc_probability
    ) / 4

    # --------------------------------------
    # Final prediction
    # --------------------------------------

    if hybrid_score >= 0.5:
        prediction = 1
        result = "Malignant"
    else:
        prediction = 0
        result = "Benign"

    return {
        "prediction": prediction,
        "result": result,
        "hybrid_score": round(
            float(hybrid_score), 4
        ),
        "logistic_regression": round(
            float(lr_probability), 4
        ),
        "svm": round(
            float(svm_probability), 4
        ),
        "random_forest": round(
            float(rf_probability), 4
        ),
        "vqc": round(
            float(vqc_probability), 4
        )
    }


# ==========================================
# 6. TEST THE HYBRID MODEL
# ==========================================

# One example containing the 8 selected features
test_patient = [
    14.0,      # mean radius
    90.0,      # mean perimeter
    600.0,     # mean area
    0.10,      # mean concave points
    16.0,      # worst radius
    105.0,     # worst perimeter
    800.0,     # worst area
    0.15       # worst concave points
]

if __name__=="__main__":
    result = hybrid_predict(test_patient)

    print("\n==============================================")
    print("       HYBRID QUANTUM-CLASSICAL RESULT")
    print("==============================================")

    print("Final Prediction :", result["result"])
    print("Hybrid Score     :", result["hybrid_score"])

    print("\nIndividual Model Scores:")
    print(
          "Logistic Regression :",
               result["logistic_regression"]
    )
    print(
             "SVM                 :",
                 result["svm"]
    )
    print(
           "Random Forest       :",
                result["random_forest"]
    )
    print(
            "VQC                 :",
                result["vqc"]
    )




# ==========================================
# 7. EVALUATION FUNCTION
# ==========================================
import json
import os
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, roc_curve

EVAL_CACHE_FILE = 'evaluation_results.json'

def evaluate_models():
    if os.path.exists(EVAL_CACHE_FILE):
        with open(EVAL_CACHE_FILE, 'r') as f:
            return json.load(f)
            
    df_test = pd.read_csv('breast_cancer_test_8_features.csv')
    y_true = df_test['target'].values
    X_test = df_test[feature_names].values
    
    # Store probabilities
    lr_probs = []
    svm_probs = []
    rf_probs = []
    vqc_probs = []
    hybrid_probs = []
    
    print('Evaluating models on test set...')
    for features in X_test:
        res = hybrid_predict(features.tolist())
        lr_probs.append(res['logistic_regression'])
        svm_probs.append(res['svm'])
        rf_probs.append(res['random_forest'])
        vqc_probs.append(res['vqc'])
        hybrid_probs.append(res['hybrid_score'])
        
    models_data = {
        'Classical ML (Logistic Regression)': lr_probs,
        'Classical ML (SVM)': svm_probs,
        'Classical ML (Random Forest)': rf_probs,
        'Quantum ML (VQC)': vqc_probs,
        'Hybrid QML': hybrid_probs
    }
    
    results = {'metrics': {}, 'roc': {}}
    
    for model_name, probs in models_data.items():
        preds = [1 if p >= 0.5 else 0 for p in probs]
        
        acc = accuracy_score(y_true, preds)
        prec = precision_score(y_true, preds, zero_division=0)
        rec = recall_score(y_true, preds, zero_division=0)
        f1 = f1_score(y_true, preds, zero_division=0)
        auc = roc_auc_score(y_true, probs)
        
        fpr, tpr, _ = roc_curve(y_true, probs)
        
        results['metrics'][model_name] = {
            'Accuracy': round(acc, 4),
            'Precision': round(prec, 4),
            'Recall': round(rec, 4),
            'F1 Score': round(f1, 4),
            'ROC-AUC': round(auc, 4)
        }
        
        results['roc'][model_name] = {
            'fpr': fpr[::2].tolist() if len(fpr) > 20 else fpr.tolist(),
            'tpr': tpr[::2].tolist() if len(tpr) > 20 else tpr.tolist()
        }
        
    with open(EVAL_CACHE_FILE, 'w') as f:
        json.dump(results, f)
        
    return results
