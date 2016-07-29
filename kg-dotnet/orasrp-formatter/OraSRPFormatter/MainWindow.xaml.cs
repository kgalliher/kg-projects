using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using Microsoft.Win32;
using System.Windows.Forms;
using Path = System.IO.Path;

namespace OraSRPFormatter
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        private System.Windows.Forms.OpenFileDialog dialog;

        public MainWindow()
        {
            InitializeComponent();
        }

        private void browseFileLocationButton_Click(object sender, RoutedEventArgs e)
        {
            string strFileName = "";
            dialog = new System.Windows.Forms.OpenFileDialog();
            dialog.Filter = "trc files (*.trc)|*.trc|All files (*.*)|*.*";
            dialog.Multiselect = true;
            dialog.InitialDirectory = "C:";
            dialog.Title = "Select a trace file";

            if (dialog.ShowDialog() == System.Windows.Forms.DialogResult.OK)
            {
                foreach (var trace in dialog.FileNames)
                {
                    TraceListView.Items.Add(trace);
                }
                strFileName = dialog.FileName;


            }
            if (strFileName == String.Empty)
            {
                return;
            }
        }

        private void fireOrasrp()
        {
            foreach (var trace in dialog.FileNames)
            {
                if (File.Exists(trace))
                {


                    string saveLocation = SaveLocationBox.Text;
                    string basename = System.IO.Path.GetFileNameWithoutExtension(trace);
                    Process process = new Process();
                    process.StartInfo.FileName = Path.Combine(Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location),
                            @"orasrp\orasrp.exe");
                    process.StartInfo.Arguments = trace + " " + saveLocation + @"\" + basename + ".html";
                    process.StartInfo.WindowStyle = ProcessWindowStyle.Hidden;
                    process.Start();
                    process.WaitForExit();
                    //System.Diagnostics.Debug.WriteLine(basename);
                    OutputBox.AppendText("Finished generating " + basename + "\r\n");
                    process.Close();
                    TraceListView.Items.Clear();
                }
                else
                {
                    errorLabel.Content = "Error occurred";
                }
            }
        }

        private void browseSaveLocationButton_Click(object sender, RoutedEventArgs e)
        {
            string folderName = "";
            FolderBrowserDialog dialog = new FolderBrowserDialog();
            dialog.ShowNewFolderButton = true;
            DialogResult result = dialog.ShowDialog();
            if (result == System.Windows.Forms.DialogResult.OK)
            {
                folderName = dialog.SelectedPath;
                SaveLocationBox.Text = dialog.SelectedPath;
            }
        }

        private void SubmitButton_Click(object sender, RoutedEventArgs e)
        {
            try
            {
                OutputBox.AppendText("");
                fireOrasrp();
            }
            catch (Exception ex)
            {
                errorLabel.Content = ex.Message;
            }
        }

        private void CancelButton_Click(object sender, RoutedEventArgs e)
        {
            Close();
        }
    }
}
