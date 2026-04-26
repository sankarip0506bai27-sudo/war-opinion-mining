import numpy as np
import pandas as pd
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from sklearn.preprocessing import MinMaxScaler
import os

LOOKBACK = 7

def prepare_time_series(csv_path):
    df = pd.read_csv(csv_path)
    df['created_time'] = pd.to_datetime(df['created_time'], errors='coerce')
    df = df.dropna(subset=['created_time','self_text'])
    df['date'] = df['created_time'].dt.date

    from nlp_pipeline import is_relevant, extract_reason, clean_text
    from sentiment_model import classify_opinion

    records = []
    sample = df.sample(min(500, len(df)), random_state=42)
    for _, row in sample.iterrows():
        text = str(row['self_text'])
        if not is_relevant(text):
            continue
        try:
            result = classify_opinion(text)
            records.append({"date": row['date'], "opinion": result['opinion']})
        except:
            continue

    if not records:
        return None, None

    rdf = pd.DataFrame(records)
    daily = rdf.groupby(['date','opinion']).size().unstack(fill_value=0)
    for col in ['Support','Oppose','Neutral']:
        if col not in daily.columns:
            daily[col] = 0
    daily = daily.sort_index().reset_index()
    return daily, rdf

def build_and_train_lstm(daily_df):
    data = daily_df[['Support','Oppose']].values.astype(float)
    scaler = MinMaxScaler()
    data_scaled = scaler.fit_transform(data)

    X, y = [], []
    for i in range(LOOKBACK, len(data_scaled)):
        X.append(data_scaled[i-LOOKBACK:i])
        y.append(data_scaled[i])

    if len(X) < 2:
        return None, None, scaler, daily_df

    X, y = np.array(X), np.array(y)

    model = Sequential([
        LSTM(64, return_sequences=True, input_shape=(LOOKBACK, 2)),
        Dropout(0.2),
        LSTM(64),
        Dropout(0.2),
        Dense(2)
    ])
    model.compile(optimizer='adam', loss='mse')
    model.fit(X, y, epochs=30, batch_size=4, verbose=0)

    return model, X, scaler, daily_df

def forecast_next_7(model, last_sequence, scaler):
    predictions = []
    seq = last_sequence.copy()
    for _ in range(7):
        pred = model.predict(seq[np.newaxis, :, :], verbose=0)
        predictions.append(pred[0])
        seq = np.vstack([seq[1:], pred])
    predictions = scaler.inverse_transform(np.array(predictions))
    return predictions