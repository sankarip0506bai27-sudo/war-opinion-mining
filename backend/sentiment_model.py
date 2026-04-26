from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

MODEL_NAME = "cardiffnlp/twitter-roberta-base-sentiment"

print("[Loading] RoBERTa sentiment model...")
sentiment_tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
sentiment_model     = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME, output_attentions=True)
sentiment_model.eval()
print("[Done] Sentiment model loaded.")

LABEL_MAP = {"LABEL_0": "Oppose", "LABEL_1": "Neutral", "LABEL_2": "Support"}

def summarize_if_long(text, max_words=30):
    words = text.split()
    if len(words) <= max_words:
        return text, False
    sentences = text.replace('!','.').replace('?','.').split('.')
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    if sentences:
        return sentences[0], True
    return " ".join(words[:30]) + "...", True

def classify_opinion(text):
    inputs = sentiment_tokenizer(
        text, return_tensors="pt",
        truncation=True, max_length=512, padding=True
    )
    with torch.no_grad():
        outputs = sentiment_model(**inputs)

    logits     = outputs.logits
    attentions = outputs.attentions
    probs      = torch.softmax(logits, dim=1).squeeze()
    pred_idx   = torch.argmax(probs).item()
    pred_label = LABEL_MAP[f"LABEL_{pred_idx}"]
    confidence = round(probs[pred_idx].item() * 100, 2)

    last_layer_attn  = attentions[-1]
    avg_attn         = last_layer_attn.squeeze(0).mean(dim=0)
    token_importance = avg_attn.mean(dim=0).numpy()
    tokens           = sentiment_tokenizer.convert_ids_to_tokens(
        inputs['input_ids'].squeeze().tolist()
    )

    highlights = []
    for token, score in zip(tokens, token_importance):
        if token in ('[CLS]','[SEP]','<s>','</s>','<pad>'):
            continue
        word = token.replace('Ġ','').replace('##','').strip()
        if len(word) > 1:
            highlights.append({"word": word, "score": round(float(score), 4)})

    highlights = sorted(highlights, key=lambda x: x['score'], reverse=True)[:10]
    return {"opinion": pred_label, "confidence": confidence, "highlights": highlights}