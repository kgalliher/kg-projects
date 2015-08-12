'''
Ken Galliher - 08/12/15
List domains of all feature classes by coded value or range.
'''

import arcpy

domains = arcpy.da.ListDomains(r"C:\Users\ken6574\AppData\Roaming\ESRI\Desktop10.3\ArcCatalog\KENG_BBOXTEST_sde.sde")

for domain in domains:
    print('Domain name: {0}'.format(domain.name))
    if domain.domainType == 'CodedValue':
        coded_values = domain.codedValues
        for val, desc in coded_values.iteritems():
            print('{0} : {1}'.format(val, desc))
        print("=========================")
    elif domain.domainType == 'Range':
        print('Min: {0}'.format(domain.range[0]))
        print('Max: {0}'.format(domain.range[1]))