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
				fl.trace("found");
				var selectedFiles = openSelectFLADialog(flaItems);
				fl.trace("numSelected = " + selectedFiles.length);
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
		fl.trace("filesToOpen = " + fileURI);
		var docDOM = fl.openDocument(fileURI);

		//add layer to target fla's
		docDOM.getTimeline().addNewLayer("jsfl_destlayer");
		
		//docDOM.clipPaste();
		for(var j=0; j< numAssets; j++)
		{
			var asset = selectedLibItems[j];
			var itemLibPath = asset.name;
			//fl.trace("assetName = " + itemLibPath);
			//lock existing layers
			var origTimeline = origDOM.getTimeline();
			//var layers = origTimeline().layers;
			/*var nLayers = layers.length;
			for(var k=0; k<nLayer; k++)
			{
				var layer = layers[k];
				origTimeline.setSelectedLayers(k, false)
				origTimeline.setLayerProperty('locked', true);
			}*/
			//origTimeline.setLayerProperty('locked', true, 'all');
			
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
	
	//var path = "";
	var selectedFiles = [];
	if(settings.dismiss == 'accept')
	{
		//
		//batchExport(settings.folder, settings.checkStr, settings.sub);
		fl.trace("accepted");
		var n = flaItems.length;
		for(var i = 0; i< n; i++)
		{
			var isSelected = settings["checkbox_" + i];//not boolean, "true"|"false" strings
			fl.trace("isSelectedA = " + isSelected);
			if(isSelected == "true")
			{
				selectedFiles.push(flaItems[i]); //push the selected filenames
			}
		}
	}
	else
	{
		fl.trace("cancellled");
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
		//output += '<label width="300" value="Importing into: ' + docOpen + '"/>';
		output += '<label width="300" value="Select FLA\'s to copy assets to"/>';
		output += '<separator/>';
		//output += '<listbox id="flaList" rows="8" >';
			var n = flaItems.length;
			for(var i=0; i< n; i++)
			{
				//output += '<menuitem label="' + flaItems[i].name + '" value="' + flaItems[i].name + '" />'; 
				output += '<checkbox id="checkbox_' + i + '" label="' + flaItems[i] + '" checked="true" />'; 
			}
		//output += '</listbox>';
	output += '</vbox>';
	output += '</dialog>';
 return output;
}

function browseForFLAFolder(numItems)
{
	return fl.browseForFolderURL("Please select a folder containing .fla files to copy assets to. \n\nYou have " + numItems + " asset(s) selected to copy.");
}

function openFileSelectDialog()
{
	var xmlGUI = buildFileSelectGUI();
	FLfile.write(tmpFileSelectXML, xmlGUI);
	
	settings = fl.getDocumentDOM().xmlPanel(tmpFileSelectXML);
}

function buildFileSelectGUI()
{
	var output = "";
	output += '<dialog id="dialog" title="Select MC to reference" buttons="accept, cancel">';
	output += '<script>';
		output += 'function okClick(){fl.xmlui.accept();}';
		output += 'function cancelClick(){fl.xmlui.cancel();}';
	output += '</script>';
	output += '<vbox>';
		//output += '<label width="300" value="Importing into: ' + docOpen + '"/>';
		output += '<label width="300" value="Select the movieclip from library to use as the video source"/>';
		output += '<separator/>';
		/*output += '<menulist id="movieclipList">';
			var n = mcItems.length;
			for(var i=0; i< n; i++)
			{
				output += '<menuitem label="' + mcItems[i].name + '" value="' + mcItems[i].name + '" />'; 
			}
		output += '</menulist>';*/
	output += '</vbox>';
	output += '</dialog>';
 return output;
}
