from flask import Flask, render_template
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)

# Configuración de la base de datos PostgreSQL
DB_HOST = "localhost"
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASS = "123456"
DB_PORT = "5432"

def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            port=DB_PORT
        )
        return conn
    except Exception as e:
        print(f"Error al conectar a PostgreSQL: {e}")
        return None

@app.route('/')
def index():
    conn = get_db_connection()
    reservas_recientes = []
    
    if conn:
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("""
                SELECT c.nombre as cliente_nombre, c.email as cliente_email, 
                       r.tipo_habitacion, r.check_in, r.check_out, r.estado, r.monto
                FROM reservas r
                JOIN clientes c ON r.cliente_id = c.id
                ORDER BY r.check_in DESC LIMIT 5;
            """)
            reservas_recientes = cur.fetchall()
            cur.close()
            conn.close()
        except Exception as e:
            print("Error consultando dashboard:", e)

    return render_template('index.html', recientes=reservas_recientes)

@app.route('/clientes')
def clientes():
    conn = get_db_connection()
    lista_clientes = []
    
    if conn:
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("SELECT id, nombre, email, telefono, to_char(fecha_registro, 'DD Mon, YYYY') as fecha FROM clientes ORDER BY fecha_registro DESC;")
            lista_clientes = cur.fetchall()
            cur.close()
            conn.close()
        except Exception as e:
            print("Error consultando clientes:", e)
            
    return render_template('clientes.html', clientes=lista_clientes)

@app.route('/reservas')
def reservas():
    conn = get_db_connection()
    lista_reservas = []
    
    if conn:
        try:
            cur = conn.cursor(cursor_factory=RealDictCursor)
            cur.execute("""
                SELECT r.id, c.nombre as cliente_nombre, r.tipo_habitacion, 
                       to_char(r.check_in, 'DD Mon, YYYY') as check_in, 
                       to_char(r.check_out, 'DD Mon, YYYY') as check_out, 
                       r.estado, r.monto
                FROM reservas r
                JOIN clientes c ON r.cliente_id = c.id
                ORDER BY r.check_in DESC;
            """)
            lista_reservas = cur.fetchall()
            cur.close()
            conn.close()
        except Exception as e:
            print("Error consultando reservas:", e)

    return render_template('reservas.html', reservas=lista_reservas)

if __name__ == '__main__':
    app.run(debug=True)
