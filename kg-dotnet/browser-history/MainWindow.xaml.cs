using System;
using System.Data;
using System.Data.SQLite;
using System.IO;
using System.Windows;

namespace BrowserHistory
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private void button_Click(object sender, RoutedEventArgs e)
        {
            string userName = userNameTextBox.Text;
            string computerName = computerNameTextBox.Text;
            GenerateHistoryTable(computerName, userName);
        }

        private void GenerateHistoryTable(string computerName, string userName)
        {
            string path = $@"\\{computerName}\c$\Users\{userName}\AppData\Local\Google\Chrome\User Data\Default";
            var google = @"Google\Chrome\User Data\Default";
            //var path = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            //var historyPath = System.IO.Path.Combine(path, google);

            label.Content = $@"Machine: {computerName}  User: {userName}";

            SQLiteConnection conn = GetBrowsingHistoryDatabase(path);
            DataTable historyDataSet = GetHistoryDataSet(conn);
            if (historyDataSet != null)
                dataGrid.ItemsSource = historyDataSet.AsDataView();
            else
                LabelMessenger(@"Could not open the history database");
        }
        private SQLiteConnection GetBrowsingHistoryDatabase(string path)
        {
            if (!Directory.Exists(path))
            {
                LabelMessenger($@"Unable to open Google directory");                
            }
            string filename = path + @"\History";
            string tmpPath = System.IO.Path.GetTempPath();
            string copyname = @"History.db";
            string historyCopyPath = System.IO.Path.Combine(tmpPath, copyname);
            //LabelMessenger(historyCopyPath);
            if (File.Exists(filename))
            {
                try
                {
                    File.Delete(copyname);
                    File.Copy(filename, copyname);
                    label.Content = $@"Copied {filename} to temp";
                    SQLiteConnection conn = new SQLiteConnection($@"Data Source={copyname};Version=3;");
                    return conn;
                }
                catch (Exception ex)
                {
                    MessageBox.Show(ex.Message);
                }
            }
            else
            {
                //LabelMessenger("No dice");
                return null;
            }

            return null;
        }

        private DataTable GetHistoryDataSet(SQLiteConnection conn)
        {
            DataSet dataset = new DataSet();
            if (conn != null)
                try
                {
                    conn.Open();
                    var sql_cmd = conn.CreateCommand();
                    var cmdText =
                        @"select datetime(last_visit_time/1000000-11644473600,'unixepoch') as visited, title, url from  urls order by last_visit_time desc";

                    SQLiteDataAdapter dataAdapter = new SQLiteDataAdapter(cmdText, conn);
                    dataset.Reset();
                    dataAdapter.Fill(dataset);
                    DataTable dataTable = dataset.Tables[0];
                    return dataTable;
                }
                catch (SQLiteException sex)
                {
                    LabelMessenger(sex.Message);
                    return null;
                }
                finally
                {
                    conn.Close();
                }

            return null;
        }

        private void LabelMessenger(string msg)
        {
            messageTextBlock.Text += msg + "\n";
        }
    }
}
