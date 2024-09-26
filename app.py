from flask import Flask,render_template,request,redirect,url_for,session
# from openai import OpenAI
from flask_mysqldb import MySQL
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
import yaml
app=Flask(__name__)
with open('db.yaml') as f:
    db=yaml.load(f,Loader=yaml.FullLoader)
app.config['MYSQL_HOST']=db['mysql_host']
app.config['MYSQL_USER']=db['mysql_user']
app.config['MYSQL_PASSWORD']=db['mysql_password']
app.config['MYSQL_DB']=db['mysql_db']
mysql=MySQL(app)
app.config['SECRET_KEY'] = 'kalpesh@5301'
login_manager=LoginManager(app)
login_manager.login_view='signin'
class User(UserMixin):
    def __init__(self,id,email,password):
        self.id=id
        self.email=email
        self.password=password
@login_manager.user_loader
def load_user(user_id):
    cur=mysql.connection.cursor()
    cur.execute("select id,email,password from fitinfo where id =%s",(user_id,))
    user_data=cur.fetchone()
    cur.close()
    if user_data:
        return User(user_data[0],user_data[1],user_data[2])
    return None

@app.route('/home')
@login_required
def home():
    return render_template('index.html')
@app.route('/signin',methods=['GET','POST'])
def signin():
    if request.method=="POST":
        email=request.form['em']
        password=request.form['pass']
        if not email or not password:
                # Redirect back to signup page with an error message
                return redirect(url_for('signin'))
        cur=mysql.connection.cursor()
        cur.execute("SELECT id,email,password FROM fitinfo where email=%s and password=%s",(email,password))
        res=cur.fetchone()
        mysql.connection.commit()
        cur.close()
        if res:
            user=User(res[0],res[1],res[2])
            login_user(user)
            return redirect(url_for('home'))
        else:
                return redirect('signin')
    return render_template('login.html')
@app.route('/signup',methods=['GET','POST'])
def signup():
    if request.method=="POST":
        action=request.form.get('action')
        if action=="signup":
            name=request.form['user']
            email=request.form['ema']
            password=request.form['pwd']
            if not name or not email or not password:
                # Redirect back to signup page with an error message
                return redirect(url_for('signup', error="All fields are required"))
            cur=mysql.connection.cursor()
            cur.execute("INSERT INTO fitinfo (name,email,password) VALUES (%s,%s,%s)",(name,email,password))
            mysql.connection.commit()
            cur.close()
            return redirect(url_for('signin'))
        else:
            return(url_for('signup'))
    return redirect(url_for('login'))
def categorize_bmi(bmi):
    if bmi <= 18.49:
        return "Underweight"
    elif 18.50 <= bmi <= 24.99:
        return "Normal"
    elif 25.00 <= bmi <= 39.99:
        return "Overweight"
    else:
        return "Obese"
def fatcat(fval,gender):
    fval=(int)(fval)
    if gender=='male':
        if 2<=fval<=5:
            return "Essential fat"
        elif 6<=fval<=13:
            return "Athletes"
        elif 14<=fval<=17:
            return "Fitness"
        elif 18<=fval<=24:
            return "Average"
        else:
            return "Obese"
    else:
        if 10<=fval<=13:
            return "Essential fat"
        elif 14<=fval<=20:
            return "Athletes"
        elif 21<=fval<=24:
            return "Fitness"
        elif 25<=fval<=31:
            return "Average"
        else:
            return "Obese"

@app.route('/log_workout')
def log_workout():
    return render_template('logworkout.html')
@app.route('/nutrition')
def nutrition():
    return render_template('nutrition.html')
@app.route('/progress')
def progress():
    return render_template('progress.html')
@app.route('/goals')
def goals():
    return render_template('goals.html')
# @app.route('/profile')
# def profile():
#     return render_template('profile.html')
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return "logout"

@app.route('/',methods=['GET','POST'])
def login():
    return render_template("login.html")
@app.route('/fat',methods=['GET','POST'])
@login_required
def fat():
    if request.method=="POST":
        gender=request.form.get('gender')
        age=request.form['age']
        weight=request.form['weight']
        height=request.form['height']
        neck=request.form['neck']
        waist=request.form['waist']
        height=(float)(height)/100
        bmi=(float)(weight)/(height*height)
        if gender=='male':
            fval=(1.20 * bmi) + (0.23 * (float)(age)) - 16.2
        else:
            fval=(1.20 * bmi) + (0.23 *(float) (age)) - 5.4
        fval=round(fval,2)
        print(gender)
        category=fatcat(fval,gender)
        return render_template('fat.html',val=fval,category=category)
    return render_template('fat.html')
@app.route('/chest_workout')
def chest():
    return render_template('chest.html')
@app.route('/triceps_workout')
def triceps():
    return render_template('triceps.html')
@app.route('/back_workout')
def back():
    return render_template('back.html')
@app.route('/biceps_workout')
def biceps():
    return render_template('biceps.html')
@app.route('/leg_workout')
def leg():
    return render_template('legs.html')
@app.route('/shoulder_workout')
def shoulder():
    return render_template('shoulder.html')
@app.route('/bmi',methods=['GET','POST'])
@login_required
def bmi():
    if request.method=="POST":
        age=request.form['age']
        weight=request.form['weight']
        height=request.form['height']
        height=(float)(height)/100
        height=height*height
        val=(float)(weight)/height
        val=round(val,2)
        category = categorize_bmi(val)
        return render_template('bmi.html',val=val,category=category)
    return render_template('bmi.html')
if __name__=="__main__":
    app.run(debug=True,port=5000)