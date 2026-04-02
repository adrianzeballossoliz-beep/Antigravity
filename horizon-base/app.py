from flask import Flask, render_template, jsonify
import psycopg2
from psycopg2.extras import RealDictCursor

app = Flask(__name__)

# Configuración Postgres local (Conexión "externa", pero se deja tu valor)
DB_HOST = "localhost" 
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASS = "123456"
DB_PORT = "5432"

def get_db_connection():
    try:
        return psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS,
            port=DB_PORT
        )
    except Exception as e:
        print(f"Error Database Connection: {e}")
        return None

# ================= RUTAS RENDER ================= #

@app.route('/')
def dashboard():
    # Retorna solo el layout SPA vacío (Las métricas se rellenarán vía JS fetch como instruído)
    return render_template('index.html')

@app.route('/clientes')
def clientes():
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("SELECT id_cliente, nombre, email FROM cliente;")
        lista_clientes = cur.fetchall()
    except Exception as e:
        print("SQL Error:", e)
        lista_clientes = []
    finally:
        if conn: conn.close()
    return render_template('clientes.html', clientes=lista_clientes)

@app.route('/reservas')
def reservas():
    conn = get_db_connection()
    try:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        cur.execute("""
            SELECT r.id_reserva, c.nombre, r.fecha_reserva
            FROM reserva r
            JOIN cliente c ON r.id_cliente = c.id_cliente;
        """)
        lista_reservas = cur.fetchall()
    except Exception as e:
        print("SQL Error:", e)
        lista_reservas = []
    finally:
        if conn: conn.close()
    return render_template('reservas.html', reservas=lista_reservas)

# ================= API DINÁMICA ================= #

@app.route('/api/metrics')
def api_metrics():
    """ Devuelve un objeto JSON unificado procesado asíncronamente en el front """
    conn = get_db_connection()
    
    # Declaración del output (con Fallbacks para tablas inexistentes según Request Open Questions)
    metrics = {
        "ingresos": 0,
        "clientes": 0,
        "reservas": 0,
        "pagos_realizados": 874, # Dato base no especificado en DB
        "satisfaccion_avg": 4.8, # Dato base no especificado en DB
        "costo_mantenimiento": 4500 # Dato base no especificado en DB
    }
    
    if conn:
        cur = conn.cursor(cursor_factory=RealDictCursor)
        try:
            # 1. Ejecutar SUM ingresos (Consulta Prompt)
            cur.execute("SELECT SUM(monto_total) AS total FROM factura;")
            res1 = cur.fetchone()
            if res1 and res1['total']:
                metrics['ingresos'] = float(res1['total'])
            
            # 2. Ejecutar COUNT clientes (Consulta Prompt)
            cur.execute("SELECT COUNT(*) AS total FROM cliente;")
            res2 = cur.fetchone()
            if res2:
                metrics['clientes'] = res2['total']
                
            # 3. Ejecutar COUNT reservas (Consulta Prompt)
            cur.execute("SELECT COUNT(*) AS total FROM reserva;")
            res3 = cur.fetchone()
            if res3:
                metrics['reservas'] = res3['total']
            
        except Exception as e:
            print(f"Error procesando API metrics: {e}")
        finally:
            cur.close()
            conn.close()
            
    return jsonify(metrics)


if __name__ == '__main__':
    app.run(debug=True)
