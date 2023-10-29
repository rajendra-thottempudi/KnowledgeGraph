from flask import Flask, jsonify
import psycopg2
from flask_cors import CORS

app = Flask(__name__)
CORS(app,  origins='*')

# Connect to the database 
# conn = psycopg2.connect(database="KnowledgeGraph", user="kgapp", 
#                         password="", host="localhost", port="5432") 
  
# create a cursor 
# cur = conn.cursor() 

  
@app.route('/create') 
def create(): 
	conn = psycopg2.connect(database="kg", 
	                    user="postgres", 
	                    password="August@981997", 
	                    host="localhost", port="5432") 

	cur = conn.cursor() 

	cur.execute('SELECT * FROM EMPLOYEES')
	rows = cur.fetchall()

	for row in rows:
		print(row);
	# Get the data from the form   
	# close the cursor and connection 
	cur.close() 
	conn.close() 

	print("success");
	return 'works'
	
@app.route('/getrows')
def get():
    conn = psycopg2.connect(database="kg",
                            user="postgres",
                            password="August@981997",
                            host="localhost",
                            port="5432")

    cur = conn.cursor()

    cur.execute('SELECT * FROM EMPLOYEES')
    rows = cur.fetchall()

    # Create a list to store the rows
    results = []

    for row in rows:
        # Append each row to the results list as a dictionary
        results.append({
            'id': row[0],
            'first_name': row[1],
            'last_name': row[2]
            # Add more columns as needed
        })

    # Close the cursor and connection
    cur.close()
    conn.close()

    # Return the results as a JSON response
    return jsonify(results)

# Define the route to fetch rows from the "journal_papers" table
@app.route('/getjournalpapers')
def get_journal_papers():
    # Establish a connection to the PostgreSQL database
    conn = psycopg2.connect(database="kg",
                            user="postgres",
                            password="August@981997",
                            host="localhost",
                            port="5432")

    cur = conn.cursor()

    # Execute a SELECT query to fetch rows from the "journal_papers" table
    cur.execute('SELECT * FROM journal_papers')
    rows = cur.fetchall()

    # Create a list to store the rows
    results = []

    for row in rows:
        # Append each row to the results list as a dictionary
        results.append({
            'id': row[0],
            'journal_name': row[1],
            'volume': row[2],
            'issue': row[3],
            'paper_title': row[4],
            'author_name': row[5],
            # Add more columns as needed
        })

    # Close the cursor and connection
    cur.close()
    conn.close()

    # Return the results as a JSON response
    return jsonify(results)

