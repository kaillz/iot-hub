from zipfile import ZipFile
import re
path = r'd:\work\smart-home\VKR\ВКР — глава 2.1.docx'
with ZipFile(path) as z:
    xml = z.read('word/document.xml').decode('utf-8')
    texts = re.findall(r'<w:t[^>]*>(.*?)</w:t>', xml)
    print('\n'.join(texts))
