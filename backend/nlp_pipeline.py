import re
import nltk
import spacy
from nltk.corpus import wordnet, stopwords
from nltk.stem import WordNetLemmatizer
from nltk import pos_tag, word_tokenize

for pkg in ['punkt','averaged_perceptron_tagger','wordnet','stopwords','punkt_tab','averaged_perceptron_tagger_eng']:
    try:
        nltk.download(pkg, quiet=True)
    except:
        pass

nlp = spacy.load("en_core_web_sm")
lemmatizer = WordNetLemmatizer()
STOP_WORDS = set(stopwords.words('english'))

# MODULE 1 - Clean Text
def clean_text(text):
    if not isinstance(text, str) or text.strip() == "":
        return ""
    text = re.sub(r'http\S+|www\S+', '', text)
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\d+', '', text)
    text = re.sub(r'\s+', ' ', text).strip().lower()
    return text

def tokenize(text):
    return word_tokenize(text)

# MODULE 2 - POS Tag + Lemmatize
KEEP_POS = ('NN','NNS','NNP','NNPS','VB','VBD','VBG','VBN','VBP','VBZ','JJ','JJR','JJS')

def pos_lemmatize(text):
    tokens = word_tokenize(text)
    tagged = pos_tag(tokens)
    filtered = [lemmatizer.lemmatize(w) for w,t in tagged if t in KEEP_POS and w not in STOP_WORDS and len(w)>2]
    return " ".join(filtered)

# MODULE 3 - Noun Chunks
def extract_noun_chunks(text):
    doc = nlp(text)
    return [chunk.text.strip() for chunk in doc.noun_chunks if len(chunk.text.strip())>2]

# MODULE 3 - WordNet Reason Mapping
REASON_KEYWORDS = {
    "Political":  ["nato","government","policy","sanction","diplomacy","zelensky","putin","biden","treaty","alliance","parliament","president","minister","election","sovereignty","regime","political","vote","law","authority"],
    "Economic":   ["economy","economic","trade","oil","price","inflation","financial","cost","fund","money","market","poverty","unemployment","budget","debt","export","import","currency","recession","gdp","tax","bank","supply"],
    "Security":   ["military","troops","weapon","attack","defend","missile","bomb","soldier","army","navy","nuclear","threat","defense","security","invasion","combat","war","gun","airforce","tank","artillery","ammunition","ceasefire"],
    "Emotional":  ["innocent","civilian","children","suffer","grief","fear","hope","victim","death","kill","humanitarian","refugee","displaced","tragedy","pain","loss","mourn","cry","family","mother","father","child","baby","orphan"]
}

def expand_with_wordnet(word):
    synonyms = set()
    for syn in wordnet.synsets(word):
        for lemma in syn.lemmas():
            synonyms.add(lemma.name().lower().replace("_"," "))
    return synonyms

def extract_reason(text):
    text_lower = text.lower()
    scores = {r: 0 for r in REASON_KEYWORDS}
    for reason, keywords in REASON_KEYWORDS.items():
        for kw in keywords:
            expanded = expand_with_wordnet(kw)
            expanded.add(kw)
            for word in expanded:
                if word in text_lower:
                    scores[reason] += 1
    best = max(scores, key=scores.get)
    return best if scores[best] > 0 else "Political"

# MODULE 4 - NER
def extract_entities(text):
    doc = nlp(text)
    entities = []
    seen = set()
    for ent in doc.ents:
        if ent.label_ in ("GPE","ORG","PERSON","NORP"):
            key = (ent.text.lower(), ent.label_)
            if key not in seen:
                seen.add(key)
                entities.append({"text": ent.text, "label": ent.label_})
    return entities

# Relevance Detection
WAR_KEYWORDS = ["war","ukraine","russia","nato","military","troops","invasion","missile","bomb","conflict","zelensky","putin","sanction","refugee","soldier","attack","defense","weapon","ceasefire","civilian","kyiv","moscow","kremlin","artillery","frontline","battalion","airstrike","warzone","combat"]

def is_relevant(text):
    if not text:
        return False
    text_lower = text.lower()
    return any(kw in text_lower for kw in WAR_KEYWORDS)

# Full Pipeline
def run_pipeline(text):
    cleaned    = clean_text(text)
    lemmatized = pos_lemmatize(cleaned)
    chunks     = extract_noun_chunks(cleaned)
    entities   = extract_entities(text)
    relevant   = is_relevant(text)
    reason     = extract_reason(text)
    return {
        "cleaned":     cleaned,
        "lemmatized":  lemmatized,
        "noun_chunks": chunks,
        "entities":    entities,
        "relevant":    relevant,
        "reason":      reason
    }