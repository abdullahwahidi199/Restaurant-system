import re
import unicodedata


def question_language(question, preferred="en"):
    if re.search(r"[ښږڼړټډڅځېۍ]", question):
        return "ps"
    if re.search(r"[\u0600-\u06ff]", question):
        return "fa"
    if re.search(r"[A-Za-z]", question):
        return "en"
    return preferred if preferred in {"en", "fa", "ps"} else "en"


SOCIAL = {"hello", "hi", "hey", "thanks", "thank you", "ok", "okay", "got it", "سلام", "تشکر", "ممنون", "مننه", "سمه ده"}
TEXT = {
    "en": {"social": "Hello! What would you like to learn about operating Pakhlai?", "clarification": "Which module or type of process do you mean?", "limitation": "I could not find enough authorized documentation to explain this reliably. Please name the module or describe the action more specifically.", "live": "I can explain Pakhlai's documented procedures, but I cannot retrieve live sales, balances, invoices, or other restaurant records. Ask how to find that information in the application."},
    "fa": {"social": "سلام! دربارهٔ کار با پخلای چه چیزی می‌خواهید یاد بگیرید؟", "clarification": "منظور شما کدام بخش یا نوع کار است؟", "limitation": "برای توضیح قابل اعتماد، اسناد مجاز کافی پیدا نشد. لطفاً نام بخش یا کار مورد نظر را دقیق‌تر بیان کنید.", "live": "می‌توانم روش‌های مستند پخلای را توضیح دهم، اما به فروش، موجودی نقد، فاکتورها یا سوابق زندهٔ رستورانت دسترسی ندارم. می‌توانید روش یافتن آن‌ها در برنامه را بپرسید."},
    "ps": {"social": "سلام! د پخلای د کارولو په اړه څه زده کول غواړئ؟", "clarification": "ستاسو موخه کومه برخه یا کوم ډول کار دی؟", "limitation": "د باور وړ تشریح لپاره کافي مجاز اسناد ونه موندل شول. مهرباني وکړئ برخه یا کار په روښانه ډول بیان کړئ.", "live": "زه د پخلای مستندې کړنلارې تشریح کولی شم، خو د رستورانت ژوندیو پلورونو، نغدو پیسو، بلونو یا نورو ریکارډونو ته لاسرسی نه لرم. په پروګرام کې یې د موندلو طریقه پوښتلی شئ."},
}

# Non-answer text is backend-authored. Model explanations never turn a refusal
# into an unsupported procedure, citation, or claim about inaccessible records.
TEXT['en'].update({
    'out_of_scope': "I can help with Pakhlai's documented workflows, but I don't cover general questions on that topic. Ask me about a Pakhlai module or task.",
    'documentation_not_found': "I couldn't find authorized Pakhlai documentation for that question. Try naming the module or action.",
    'insufficient_evidence': "I don't have enough documented information to answer that reliably. Please specify the Pakhlai module or the step you need help with.",
})
TEXT['fa'].update({
    'out_of_scope': 'می‌توانم دربارهٔ روش‌های مستند پخلای کمک کنم، اما این موضوع در محدودهٔ راهنمای من نیست. دربارهٔ یک بخش یا کار در پخلای بپرسید.',
    'documentation_not_found': 'برای این پرسش اسناد مجاز پخلای پیدا نکردم. لطفاً نام بخش یا کار مورد نظر را بگویید.',
    'insufficient_evidence': 'برای پاسخ قابل اعتماد، معلومات مستند کافی ندارم. لطفاً بخش پخلای یا مرحلهٔ مورد نظر را مشخص کنید.',
})
TEXT['ps'].update({
    'out_of_scope': 'زه د پخلای د مستندو کړنلارو په اړه مرسته کولی شم، خو دا موضوع زما د لارښود له ساحې بهر ده. د پخلای د یوې برخې یا کار په اړه وپوښتئ.',
    'documentation_not_found': 'د دې پوښتنې لپاره مې د پخلای مجاز اسناد ونه موندل. مهرباني وکړئ د برخې یا کار نوم ووایئ.',
    'insufficient_evidence': 'د باوري ځواب لپاره کافي مستند معلومات نه لرم. مهرباني وکړئ د پخلای برخه یا اړوند ګام روښانه کړئ.',
})


def is_social(question):
    text = unicodedata.normalize("NFC", question).casefold().strip(" .!?؟\n\t")
    if text in SOCIAL:
        return True
    # Match the whole message: a greeting prefixed to a factual question must
    # still take the normal authenticated search/fetch path.
    return bool(re.fullmatch(r"(?:(?:hello|hi|hey)[,!.\s]+)?how are you(?: doing)?(?: today)?", text))


def is_live_data_request(question):
    # Narrow, conservative routing for clear live-record requests. Other questions
    # still receive the documentation-only system boundary and no business tools.
    text = question.casefold()
    # Explicit current quantities/counts need live records, not a documentation
    # citation. Keep ordinary "how do I ..." procedures outside these additions.
    procedural = re.match(r"^\s*how\s+(?:do|can|should|would)\s+(?:i|we)\b", text)
    if not procedural and re.search(r"\b(?:what|show|tell|give)\b.{0,45}\bcurrent\b.{0,35}\b(?:stock|inventory|cash|balance|sales|revenue)\b|\bhow many\b.{0,65}\b(?:orders|invoices|payments|items)\b.{0,45}\b(?:today|currently|right now)\b", text):
        return True
    return bool(re.search(r"\b(show|open|retrieve|lookup|look up)\s+(invoice|order|payroll|payment)\s*#?\s*\d+|\b(today|right now|currently|actual|live)\b.{0,65}\b(sales|sold|cash|balance|unpaid|revenue)\b|\b(sales|sold|cash|balance|suppliers)\b.{0,65}\b(today|right now|currently|actual|unpaid)\b", text)
                or re.search(r"(فروش|نقد|خرڅلاو).{0,30}(امروز|نن|همین حال)|(امروز|نن).{0,30}(فروش|نقد|خرڅلاو)", text))
