/**
* CopyFasta
* JSFL script to copy library assets from one source Flash document to many target Flash documents
* @author Chris Hanna
*/

var origDOM = fl.getDocumentDOM();
if(origDOM != null)
{	
	var lib = origDOM.library;
	var tmpFileSelectXML = fl.configURI + "/TEMP_copyassets.xml";
	
	var selectedLibItems = lib.getSelectedItems();
	var n = selectedLibItems.length;
	if(n == 0)
	{	
		alert("You did not select any items in the library to copy");
	} else
	{
		var folderURI = browseForFLAFolder(n);
		if(folderURI != null)
		{
			var folderContents = FLfile.listFolder(folderURI);
			var numItems = folderContents.length;
			var flaItems = [];
			for(var i=0; i< numItems; i++)
			{
				var itemURI = folderContents[i];
				if(itemURI.indexOf(".fla") >= 0) //do better check later
				{
					flaItems.push(itemURI);
				}
			}
			
			var numFla = flaItems.length;
			if(numFla > 0)
			{
				var selectedFiles = openSelectFLADialog(flaItems);
				if(selectedFiles != null)
				{
					if(selectedFiles.length > 0)
					{	
						openSelectedFLADocuments(folderURI, selectedFiles, selectedLibItems);
					} else
					{
						alert("You did not select any documents");
					}
				}
			} else
			{
				alert("No fla files found in the selected folder");
			}
		}
	}
} else
{
	alert("Please have a document open to copy assets from");
}

function openSelectedFLADocuments(folderURI, selectedFiles, selectedLibItems)
{
	var origDocWidth = origDOM.width;
	var origDocHeight = origDOM.height;
	
	//open each file and copy assets into
	var numFiles = selectedFiles.length;
	var numAssets = selectedLibItems.length;
	for(var i = 0; i< numFiles; i++)
	{
		var fileURI = folderURI +"/" + selectedFiles[i];
		var docDOM = fl.openDocument(fileURI);

		//add layer to target fla's
		docDOM.getTimeline().addNewLayer("jsfl_destlayer");
		
		//docDOM.clipPaste();
		for(var j=0; j< numAssets; j++)
		{
			var asset = selectedLibItems[j];
			var itemLibPath = asset.name;
			var origTimeline = origDOM.getTimeline();
			
			origTimeline.addNewLayer("jsfl_sourcelayer");
			origDOM.library.addItemToDocument({x:0, y:0}, itemLibPath);
			origDOM.setSelectionRect({left:0, top:0, right:origDocWidth, bottom:origDocHeight}, true, true);
			origDOM.clipCopy();

			docDOM.clipPaste();
			
			origTimeline.deleteLayer(0);
		}
		
		//delete layer from target fla's
		docDOM.getTimeline().deleteLayer(0);
		
		docDOM.save();
		docDOM.close(false);
	}
}

/**
*	returns a list of selected fla files
*/
function openSelectFLADialog(flaItems)
{
	var flaSelectXML = fl.configURI  + "/TEMP_selectFLA.xml";
	var flaSelectGUI = buildSelectFLAGUI(flaItems);
	FLfile.write(flaSelectXML, flaSelectGUI);
	
	var settings = origDOM.xmlPanel(flaSelectXML);
	
	var selectedFiles = [];
	if(settings.dismiss == 'accept')
	{
		var n = flaItems.length;
		for(var i = 0; i< n; i++)
		{
			var isSelected = settings["checkbox_" + i];//not boolean, "true"|"false" strings
			if(isSelected == "true")
			{
				selectedFiles.push(flaItems[i]); //push the selected filenames
			}
		}
	}
	
	return selectedFiles;
}

function buildSelectFLAGUI(flaItems)
{
	var output = "";
	output += '<dialog id="selectFLA" title="Select FLA\'s to copy assets to" buttons="accept, cancel">';
	output += '<script>';
		output += 'function okClick(){fl.xmlui.accept();}';
		output += 'function cancelClick(){fl.xmlui.cancel();}';
	output += '</script>';
	output += '<vbox>';
		output += '<label width="300" value="Select FLA\'s to copy assets to"/>';
		output += '<separator/>';
			var n = flaItems.length;
			for(var i=0; i< n; i++)
			{
				output += '<checkbox id="checkbox_' + i + '" label="' + flaItems[i] + '" checked="true" />'; 
			}
	output += '</vbox>';
	output += '</dialog>';
 return output;
}

function browseForFLAFolder(numItems)
{
	return fl.browseForFolderURL("Please select a folder containing .fla files to copy assets to. \n\nYou have " + numItems + " asset(s) selected to copy.");
}

