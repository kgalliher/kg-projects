import glob
import os

'''
Search for a string in all files in a folder
'''
path = r"C:\Path\To\Trace\Folder"
search_string = "INSERT INTO telco.GPS_POINT_TRANSIT"
num = 0
os.chdir(path)
for files in glob.glob( "*.trc" ):
    f = open( files, 'r' )
    for line in f:
        if search_string in line:
            print("\t" + str(num) + ". " + f.name + " - " + line )
            num = num + 1
