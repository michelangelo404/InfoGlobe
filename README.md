A Pen created on CodePen.io. Original URL: [https://codepen.io/jorin/pen/YNajXZ](https://codepen.io/jorin/pen/YNajXZ).

Ho usato questa guida: https://tms-dev-blog.com/python-backend-with-javascript-frontend-how-to/
per python bisogna creare un ambiente virtuale usando il comando "python -m venv venv" successivamente il comando "venv\Scripts\activate.bat" per attivarlo e a quel punto andremo a installare le librerie importate nel file parser.py con il comando "pip install nome_libreria" (questo per tenere pulito windows e avere tutte le librerie in un unica cartella).
Per far partire flask basta dare "python parser.py"
per il server http semplice invece "npm install http-server" però vedere se si riesce a fare tutto in un unico server


Per far partire il server ho usato l'estensione di visual studio code "Live server", basta fare click destro sull'index e cliccare "Open with live server"
Mentre per mettere a disposizione il file del parser devo fare "py dist/api/parser.py"


