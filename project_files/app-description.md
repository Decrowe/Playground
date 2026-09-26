# Decision Maker - App description

## Vision
Ich möchte eine App, die mir hilft meine Aufgaben zu ordne, zu priorisieren und gegebenenfalls in kleinere Aufgaben herunterzubrechen, wenn ich merke dass Aufgaben zu groß und unüberschauber sind.

## Anforderungen

In der Oberfläche soll eine Tabelle zusehen sein, welche alle Aufgaben anzeigt. Die Aufgaben sollen nach einem rating sortiert sein. Das Rating basiert auf folgenden Kriterien:
- Erwarrtung (Wie wahrscheinlich ist es, dass das Ziel erreicht werden kann?)
- Zeitlicher Aufwand 
- Arbeitsaufwand

Die einzelnen Kritierien können vom Benutzer beim Anlegen einer Aufgabe gesetzt werden. Jedes Kriterium kann einen Wert von 0-5 haben:
- 0: Sehr Schlecht
- 1: Schlecht
- 2: Ausreichend
- 3: Befriedigend
- 4: Gut
- 5: Sehr Gut

Das Rating einer Aufgabe erfolgt über die Summe der Punkte der einzelnen Kriterien einer Aufgabe.
Aufgaben werden in der Tabelle, abhängig ihres Ratings farblich dargestellt.
Die Farbpalette reicht von Rot über Orange bis Grün.

Aufgaben herunterbrechen:
Jede Aufgabe soll herunterbrechbar sein. Dafür wird beim Hovern über einen Eintrag in der Tabelle ein Button angezeigt. Drückt man darauf, soll ein Dialog erscheinen, der die Aufgabe mit seinen einzelnen Kriterien anzeigt. Der Benutzer hat anschließend die Möglichkeit die Aufgabe in beliebig viele neue Aufgaben zu unterteilen. Ziel ist es dabei, die Große Aufgabe so herunterzubrechen, dass mehrere kleine Aufgaben entstehen, die besser zu abarbeiten sind.

## Technische vorgaben
- Components: Benutze Angular Material als Bubliothek. Bevor du anfängst eigene komponenten zu benutzen, schaue erst nach, ob es von Angular Material bereits solche componenten oder Tools gibt.

- Es soll kein Routing geben. Alles findet auf einer Seite statt.

- Es wird keine Server-Kommunikation geben. Benutze lediglich den local storage.
- Die App unterteilt sich in 3 logische Ebeben:
- 1) Application: UI, Fassaden...
- 2) Domain: Business-Logik, State-Management, Models, Enteties,...
- 3) Infrastruktur: Data-Services, Kommnukation zu Datenbanken, Servern, Storages,...

## Testing
- Für Tests, in denen ein Data-service verwendet wird, soll es eine MockImplimentierung des Data-Services geben. Um die Mock und richtige Implimentierung synchron zu halten, erstelle ein Interface (Port) für die Data-Services (Adapter) 