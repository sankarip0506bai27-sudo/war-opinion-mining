from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import io, base64
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from nlp_pipeline import clean_text, is_relevant, extract_reason
from sentiment_model import classify_opinion, summarize_if_long

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

CSV_PATH = "data/war_comments_10000.csv"

SUPPORT_WORDS = ["support","defend","help","aid","stand","solidarity","protect","ally","brave","hero","freedom","liberate","victory","resist","united","courage","justice"]
OPPOSE_WORDS  = ["condemn","stop","invasion","attack","bombing","casualties","destroy","kill","suffering","victim","refugee","crisis","brutal","civilian","innocent","tragedy","against","war crime"]

def fast_opinion(text):
    t = text.lower()
    s = sum(1 for w in SUPPORT_WORDS if w in t)
    o = sum(1 for w in OPPOSE_WORDS  if w in t)
    if s == 0 and o == 0: return "Neutral"
    if s > o: return "Support"
    if o > s: return "Oppose"
    return "Neutral"

class CommentRequest(BaseModel):
    text: str

@app.post("/analyze")
def analyze(req: CommentRequest):
    text = req.text.strip()
    if not text:
        return {"error": "Empty input"}

    was_summarized  = False
    summarized_text = text

    if len(text.split()) > 30:
        summarized_text, was_summarized = summarize_if_long(text)

    relevant = is_relevant(text)

    if not relevant:
        return {
            "original_text": text,
            "summarized":    was_summarized,
            "summary":       summarized_text if was_summarized else None,
            "relevant":      False,
            "opinion":       "Irrelevant",
            "confidence":    None,
            "reason":        None,
            "entities":      [],
            "noun_chunks":   [],
            "highlights":    []
        }

    from nlp_pipeline import run_pipeline
    pipeline_result  = run_pipeline(summarized_text)
    sentiment_result = classify_opinion(summarized_text)

    return {
        "original_text": text,
        "summarized":    was_summarized,
        "summary":       summarized_text if was_summarized else None,
        "relevant":      True,
        "opinion":       sentiment_result["opinion"],
        "confidence":    sentiment_result["confidence"],
        "reason":        pipeline_result["reason"],
        "entities":      pipeline_result["entities"],
        "noun_chunks":   pipeline_result["noun_chunks"][:5],
        "highlights":    sentiment_result["highlights"],
        "lemmatized":    pipeline_result["lemmatized"]
    }

@app.get("/dashboard")
def dashboard():
    df = pd.read_csv(CSV_PATH)
    df = df.dropna(subset=['self_text'])
    df['self_text'] = df['self_text'].astype(str)
    df['created_time'] = pd.to_datetime(df['created_time'], errors='coerce')
    df = df.dropna(subset=['created_time'])
    df = df.sort_values('created_time')

    relevant_df = df[df['self_text'].apply(is_relevant)].reset_index(drop=True)

    # Use 500 comments spread evenly across dataset
    step   = max(1, len(relevant_df) // 500)
    sample = relevant_df.iloc[::step].head(500)

    opinions = sample['self_text'].apply(fast_opinion)
    reasons  = sample['self_text'].apply(extract_reason)

    return {
        "total_comments":    len(df),
        "relevant_comments": len(relevant_df),
        "opinion_counts":    opinions.value_counts().to_dict(),
        "reason_counts":     reasons.value_counts().to_dict()
    }

@app.get("/wordcloud")
def get_wordcloud():
    df = pd.read_csv(CSV_PATH)
    df = df.dropna(subset=['self_text'])
    # Use 500 random comments for word cloud
    sample   = df.sample(min(500, len(df)), random_state=42)
    all_text = " ".join(sample['self_text'].astype(str).tolist())
    cleaned  = clean_text(all_text)

    wc = WordCloud(
        width=1000, height=460,
        background_color='#f5f0e8',
        colormap='copper',
        max_words=150,
        collocations=False
    ).generate(cleaned)

    buf = io.BytesIO()
    plt.figure(figsize=(13,6), facecolor='#f5f0e8')
    plt.imshow(wc, interpolation='bilinear')
    plt.axis('off')
    plt.tight_layout(pad=0)
    plt.savefig(buf, format='png', facecolor='#f5f0e8', bbox_inches='tight')
    plt.close()
    buf.seek(0)
    return {"image": base64.b64encode(buf.read()).decode('utf-8')}

@app.get("/timeline")
def get_timeline():
    df = pd.read_csv(CSV_PATH)
    df['created_time'] = pd.to_datetime(df['created_time'], errors='coerce')
    df = df.dropna(subset=['created_time', 'self_text'])

    relevant_df = df[df['self_text'].apply(lambda x: is_relevant(str(x)))].copy()

    # Group by 30-minute intervals for more data points
    relevant_df['period'] = relevant_df['created_time'].dt.floor('30min').dt.strftime('%d %b %H:%M')

    records = []
    for _, row in relevant_df.iterrows():
        records.append({
            "period":  row['period'],
            "opinion": fast_opinion(str(row['self_text']))
        })

    if not records:
        return {"dates": [], "support": [], "oppose": [], "neutral": []}

    rdf = pd.DataFrame(records)
    grouped = rdf.groupby(['period', 'opinion']).size().unstack(fill_value=0)
    for col in ['Support', 'Oppose', 'Neutral']:
        if col not in grouped.columns:
            grouped[col] = 0

    grouped = grouped.reset_index()

    # Sort correctly by actual datetime
    relevant_df['floor_str'] = relevant_df['created_time'].dt.floor('30min').dt.strftime('%d %b %H:%M')
    order = (
        relevant_df[['created_time', 'floor_str']]
        .drop_duplicates('floor_str')
        .sort_values('created_time')['floor_str']
        .tolist()
    )
    grouped['sort_idx'] = grouped['period'].apply(lambda x: order.index(x) if x in order else 999)
    grouped = grouped.sort_values('sort_idx').drop(columns='sort_idx')

    return {
        "dates":   grouped['period'].tolist(),
        "support": grouped['Support'].tolist(),
        "oppose":  grouped['Oppose'].tolist(),
        "neutral": grouped['Neutral'].tolist()
    }
@app.get("/")
def root():
    return {"status": "War Opinion Mining API running"}