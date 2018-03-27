using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using ESRI.ArcGIS.Catalog;
using ESRI.ArcGIS.CatalogUI;
using ESRI.ArcGIS.Geodatabase;

namespace FabricAccuracyQuery
{
    public partial class TheDialog : Form
    {
        public TheDialog()
        {
            InitializeComponent();
        }

        private IGxObject AddExistingFilters()
        {
            IEnumGxObject enumGxObject = null;

            IGxObjectFilter gxObjectFilter_Fabrics = new GxFilterCadastralFabricsClass();
            IGxDialog gxDialog = new GxDialogClass();
            IGxObjectFilterCollection gxObjectFilterCollection = (IGxObjectFilterCollection) gxDialog;
            gxObjectFilterCollection.AddFilter(gxObjectFilter_Fabrics, true);
            gxDialog.Title = "Browse Fabrics";
            gxDialog.DoModalOpen(0, out enumGxObject);
            return enumGxObject.Next();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            try
            {
                IGxObject fabric = AddExistingFilters();
                textBox1.Text = fabric.FullName;

                string accuracyTableName = fabric.Name + "_Accuracy";
                string gdbPath = fabric.Parent.Parent.FullName;
                ITable accuracyTable = GetAccuracyTable(accuracyTableName, gdbPath);
                List<string> results = Fabric.QueryStandaloneTable(accuracyTable, "description");

                StringBuilder sb = new StringBuilder();

                sb.AppendLine(@"Row count: " + results[0].ToString());
                sb.AppendLine("");
                if (results.Count <= 1)
                {
                    sb.Append($"Empty Accuracy table. ({accuracyTableName})");
                }
                else if (results[1].Contains("nvdf"))
                {
                    sb.Append(
                        $"{accuracyTableName} contains rows but but Description column values are null or empty.");
                }
                else
                {
                    sb.AppendLine(@"Accuracy Description Column");
                    for (int i = 1; i < results.Count; i++)
                    {
                        sb.AppendLine(results[i]);
                    }
                }
                richTextBox1.Text = sb.ToString();
            }
            catch (Exception ex)
            {
                MessageBox.Show($@"An error occured: {ex.Message}");
            }
        }

        private ITable GetAccuracyTable(string accuracyTableName, string gdbPath)
        {
            IWorkspace workspace = null;

            if (gdbPath.Contains(".gdb"))
            {
                workspace = ConnectToFgdb(gdbPath);
            }
            else if (gdbPath.Contains(".sde"))
            {
                workspace = connectToSDE_cf(@gdbPath);
                accuracyTableName = accuracyTableName.Split('.')[2];
            }

            IFeatureWorkspace featureWorkspace = (IFeatureWorkspace) workspace;
            if (featureWorkspace != null)
            {
                ITable table = featureWorkspace.OpenTable(accuracyTableName);
                return table;
            }
            else
            {
                MessageBox.Show($@"Workspace: {gdbPath} not found!", @"Fail!");
                return null;
            }
        }

        private IWorkspace ConnectToFgdb(string path)
        {
            Type factoryType = Type.GetTypeFromProgID(
                "esriDataSourcesGDB.FileGDBWorkspaceFactory");
            IWorkspaceFactory workspaceFactory = (IWorkspaceFactory) Activator.CreateInstance
                (factoryType);
            return workspaceFactory.OpenFromFile(path, 0);
        }

        private static IWorkspace connectToSDE_cf(string connectionFile)
        {
            Guid sdeGuid = new Guid("D9B4FA40-D6D9-11D1-AA81-00C04FA33A15");
            Type factoryType = Type.GetTypeFromProgID("esriDataSourcesGdb.SdeWorkspaceFactory");
            IWorkspaceFactory wsf = Activator.CreateInstance(factoryType) as IWorkspaceFactory;
            string sdeConnFile = @connectionFile;

            IWorkspace ws = wsf?.OpenFromFile(sdeConnFile, 0);
            return ws;
        }
    }
}