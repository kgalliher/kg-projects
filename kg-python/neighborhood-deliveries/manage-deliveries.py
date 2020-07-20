import sqlite3
import sys
import json
import datetime
import pandas as pd

db_path = ""

with open(r"C:\data\covid-python\config.json", "r") as conf:
    contents = conf.read()
    j = json.loads(contents)
    db_path = j["db_path"]

if len(db_path) < 1:
    print("Error reading config file.")
    sys.exit()

conn = sqlite3.connect(db_path)


def get_delivery_df(sql=""):
    if sql == "":
        sql = "SELECT id, Company, MyHouse FROM deliveries"
    return pd.read_sql(sql, conn)


def display_delivery_count():
    df = get_delivery_df("SELECT id as count, Company FROM deliveries")
    print(df.groupby("Company").count().sort_values(by="count", ascending=False))
    print("Total: ", df.shape[0])


if len(sys.argv) == 1:
    sys.exit()
if sys.argv[1] == "help":
    print("View or Insert or Delete deliveries:")
    print("Flags:")
    print("\t'add': Add a new delivery to the table")
    print("\t'view': View all existing deliveries")
    print("\t'count': Get a count of deliveries grouped by company")
    print(
        "\t'delete' ('<row_id>'): Delete a single delivery using its row ID")
    print("")
elif sys.argv[1] == "count":
    display_delivery_count()
elif sys.argv[1] == "view":
    df = get_delivery_df()
    print(df)
elif sys.argv[1] == "delete":
    if sys.argv[2] is not None:
        id = sys.argv[2]
        curse = conn.cursor()
        curse.execute("DELETE FROM deliveries WHERE id = (?)", [id])
        conn.commit()
        display_delivery_count()
elif sys.argv[1] == "add":
    while True:
        _date = input("Enter the date ('x' for current time, 'q' to exit):  ")
        if _date == "x":
            _date = datetime.datetime.now()
        if _date == "q":
            break

        _company = input("Enter delivery company name:  ")
        my_house = input("Is the delivery for you?  ")

        print(_date, _company, my_house)
        confirm = input("Is this correct?")

        if confirm.upper() == "YES" or confirm.upper() == "Y":
            curse = conn.cursor()
            curse.execute("INSERT INTO deliveries (Date, Company, MyHouse) VALUES (?, ?, ?)", [
                _date, _company, my_house])
            conn.commit()

            display_delivery_count()

        else:
            print("Discarded edit")
else:
    print("What are you trying to do?  Use flag 'add', 'delete + row id', 'view' or 'count'")
