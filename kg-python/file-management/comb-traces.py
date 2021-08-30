import glob
import os

'''
Search for a string in all files in a folder
'''
# path = r"C:\Path\To\Trace\Folder"
path = r"C:\temp\intercepts"
search_string = "select count(*) from sqlite_master"
num = 0
os.chdir(path)
for _file in glob.glob( "*.362" ):
    with open(_file, "r") as f:
        for line in f:
            if search_string in line:
                print("\t" + str(num) + ". " + f.name + " - " + line )
                num = num + 1
