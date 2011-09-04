using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.Practices.ServiceLocation;
using SolrNet;

namespace CodeIndex
{
    public class CodeIndexer
    {
        private const int DOCS_PER_POST = 30;

        public void DoIndexing(string[] projectNames)
        {
            //load the settings file
            IndexSettings settings = IndexSettings.LoadSettings();

            Startup.Init<CodeDocument>(settings.SolrUrl);
            
            var solr = ServiceLocator.Current.GetInstance<ISolrOperations<CodeDocument>>();

            //do a commit just in case
            solr.Commit();
            
            var selectedProjects = settings.Projects.ToArray();

            //if it has been specified to run a specific project
            if (projectNames.Length > 0)
            {
                selectedProjects = settings.Projects.Where(X => projectNames.Contains(X.ProjectName)).ToArray();
            }

            foreach (var proj in selectedProjects)
            {
                UpdateSolrIndexForProject(settings, solr, proj);
            }

        }

        private  void UpdateSolrIndexForProject(IndexSettings settings, ISolrOperations<CodeDocument> solr, Project proj)
        {
            
            List<string> alldocs = null;

            //find out if directory exists before doing anything to the index
            if (!Directory.Exists(proj.Path))
            {
                Console.WriteLine(DateTime.Now.ToString() + ": Directory for project " + proj.ProjectName + " did not exist, skipping");
                return;
            }

            //find all of the files
            using (var csw = new ConsoleStopWatch(""))
            {
                
                    
                alldocs = GetDocsForProject(proj, settings.DefaultIncludedPath, settings.DefaultExcludedPath);
                csw.Name = "Finding " + alldocs.Count.ToString() + " files for project " + proj.ProjectName;
            }

            using (var csw = new ConsoleStopWatch("Deleting all solr docs for project " + proj.ProjectName))
            {
                solr.Delete(new SolrQuery("project:\"" + proj.ProjectName + "\""));
                solr.Commit();
            }

            //breakout the file list into chunks of DOCS_PER_POST for speed. One at a time is too slow, too many can cause solr memory and thread issues
            var fileChunks = Chunkify(alldocs.ToArray(), DOCS_PER_POST);

            using (var csw = new ConsoleStopWatch("Adding the documents to solr for project " + proj.ProjectName))
            {
                //convert each to a solr document
                for (int i = 0; i < fileChunks.Length; i++)
                {
                    var file = fileChunks[i];
                    var codedocs = MakeDocument(file, proj);
                    //submit each to solr
                    //Tweak to leverage new CommitIWithin option of SolrNet so that we do not need to pay the cost of a commit for each group.
                    solr.AddRange(codedocs, new AddParameters { CommitWithin = 10000 });
                    
                }
                                
                solr.Optimize();

            }
        }

        private List<string> GetDocsForProject(Project proj, string[] defaultInclude, string[] defaultExclude)
        {
            string rootPath = proj.Path;
            List<string> allDocs = new List<string>();
            List<string> filteredDocs = new List<string>();

            //first get a list of all the documents under the root
            allDocs.AddRange(Directory.GetFiles(rootPath, "*", SearchOption.AllDirectories));

            //include ones that match the default pattern
            foreach (var pattern in defaultInclude)
            {
                filteredDocs.AddRange(allDocs.Where(X => Regex.IsMatch(X, pattern, System.Text.RegularExpressions.RegexOptions.IgnoreCase)));
            }

            //include ones that match the project pattern
            foreach (var pattern in proj.IncludedPath)
            {
                filteredDocs.AddRange(allDocs.Where(X => Regex.IsMatch(X, pattern, System.Text.RegularExpressions.RegexOptions.IgnoreCase)));
            }

            //exclude default patterns
            foreach (var pattern in defaultExclude)
            {
                filteredDocs.RemoveAll(X => Regex.IsMatch(X, pattern, System.Text.RegularExpressions.RegexOptions.IgnoreCase));
            }

            //exlude project patterns
            foreach (var pattern in proj.ExcludedPath)
            {
                filteredDocs.RemoveAll(X => Regex.IsMatch(X, pattern, System.Text.RegularExpressions.RegexOptions.IgnoreCase));
            }


            return filteredDocs;
        }

        private CodeDocument[] MakeDocument(string[] filepath, Project project)
        {
            var allDocs = new List<CodeDocument>();

            for (int i = 0; i < filepath.Length; i++)
            {
                var filename = Path.GetFileName(filepath[i]);
                //shouldn't have to do this
                var filedata = File.ReadAllText(filepath[i]).Trim();

                //we don't care about empty files
                if (filedata.Length == 0)
                    continue;

                var thisDocument = new CodeDocument();

                thisDocument.ID = CalculateMD5Hash(filepath[i]);
                thisDocument.Name = filename;
                thisDocument.FileData = filedata;
                thisDocument.FullPath = filepath[i];
                thisDocument.Project = project.ProjectName;
                thisDocument.Category = project.Category;

                allDocs.Add(thisDocument);
            }


            return allDocs.ToArray();
        }


        public string[][] Chunkify(string[] fullList, int chunkSize)
        {
            var all = new List<string[]>();

            for (int i = 0; i < fullList.Length; i += chunkSize)
            {
                List<string> each = new List<string>();

                foreach (string item in fullList.Skip(i).Take(chunkSize).ToArray())
                {
                    each.Add(item);
                }

                all.Add(each.ToArray());
            }

            return all.ToArray();

        }

        //stolen from http://blogs.msdn.com/b/csharpfaq/archive/2006/10/09/how-do-i-calculate-a-md5-hash-from-a-string_3f00_.aspx
        public string CalculateMD5Hash(string input)
        {
            // step 1, calculate MD5 hash from input
            MD5 md5 = System.Security.Cryptography.MD5.Create();
            byte[] inputBytes = System.Text.Encoding.ASCII.GetBytes(input);
            byte[] hash = md5.ComputeHash(inputBytes);

            // step 2, convert byte array to hex string
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < hash.Length; i++)
            {
                sb.Append(hash[i].ToString("X2"));
            }
            return sb.ToString();
        }


    }
}
