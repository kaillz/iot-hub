from docx import Document
path = r'd:\work\smart-home\VKR\ВКР — глава 2.1.docx'
doc = Document(path)
for i in range(104, 130):
    print(i, repr(doc.paragraphs[i].text))
