from docx import Document
path = r'd:\work\smart-home\VKR\ВКР — глава 2.1.docx'
doc = Document(path)
for i,p in enumerate(doc.paragraphs):
    if '2.1' in p.text or '2.2' in p.text or '2.3' in p.text:
        print(i, repr(p.text.strip()))
