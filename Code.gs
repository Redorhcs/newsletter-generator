const mymailSheet = 'your-google-sheet-goes-here';
const mymailDoc = 'your-google-document-goes-here';

const announcement = { // The fields here should loosely correspond with your google sheet headers
    emailAddr : "",
    contactName : "",
    announcementTitle : "",
    announcementText : "",
    category : "",
    endDate : "",
    //image : ""
}
function Announcement(email, name, title, text, category, endDate){ //these should correspond with items in the above const
  this.email = email;
  this.name = name;
  this.title = title;
  this.text = text;
  this.category = category;
  this.endDate = endDate;
  //this.image = image;
}

Object.assign(Announcement.prototype, announcement) // creates Announcement object and links template

function sort_sheet_by_category(){ // helper function to sort, not currently used
  var ss = SpreadsheetApp.openById(mymailSheet);
  //var sheet = ss.getSheets()[0];
  ss.sort(5, true) //sort ascending
}

function process_entries(){ // creates the actual doc
  var ss = SpreadsheetApp.openById(mymailSheet);
  var data = ss.getDataRange().getValues();

  // make sets, each containing the respective announcement types. In my example, these correspond to the four options in a google form multiple choice

  const myevents = new Set()
  const yaleevents = new Set()
  const sustain = new Set()
  const ims = new Set()
  
  // end sets

  var todayDate = new Date(); //used for comparison


  for (var row = 0; row < data.length; row++) { // get each unique entry on the form, going row-by-row and grabbing data out of each col
    var email = data[row][1];
    var name = data[row][2];
    var title = data[row][3];
    var text = data[row][4];
    var category = data[row][5];
    var dat = data[row][6];
    //var img = data[row][7];
    // set

    if (dat.valueOf() < todayDate.valueOf()){ // quick date comparison to remove old events
      Logger.log("announcement is older than today's date, ejecting")
      continue
    }
    else {
      Logger.log("announcement is SHORTER, processing")
    }

    const temp = new Announcement(email, name, title, text, category, dat); // create Announcement obj

    if (temp.category === "What's Happening in Murray: MY Only Events"){ // category sorter
      myevents.add(temp);
    }
    else if (temp.category === "Things That Might Interest You: Any Yale/NHV Event"){
      yaleevents.add(temp);
    }
    else if (temp.category === "Sustainability Corner"){
      sustain.add(temp);
    }
    else if (temp.category === "Intramurals"){
      ims.add(temp);
    }
    else {
      Logger.log('mystery event fell to the end')
    }

    }



    //sob

  var doc = DocumentApp.openById(mymailDoc); // open Google Doc
  //var doc = DocumentApp.create('Sample MyMail Document');
  var body = doc.getBody();
  
  // interestingly, text needs to be inserted in REVERSE order - so content first, then add the title, it'll generate correctly then.
  
  if (sustain.size > 0){ // check if any set is EMPTY, if so skip
    sustain.forEach(insertText)
    body.insertParagraph(0, "Sustainability Corner")
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  }
  if (ims.size > 0) {
    ims.forEach(insertText)
    body.insertParagraph(0, "IM Update")
        .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  }
  if (yaleevents.size > 0){
    yaleevents.forEach(insertText)
    body.insertParagraph(0, "Things That Might Interest You")
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  }
  if (myevents.size > 0){
    myevents.forEach(insertText) // this needs some function now
    body.insertParagraph(0, "What's Happening in Murray?")
      .setHeading(DocumentApp.ParagraphHeading.HEADING2);
  }    
}


function logMe(value){ // helper function
  Logger.log(value);
  Logger.log(value.text);
}


function insertText(obj) { // helper function to actually insert doc text. TODO insert image.
  var doc = DocumentApp.openById(mymailDoc);
  //var doc = DocumentApp.create('Sample MyMail Document');
  var body = doc.getBody();
  //var rowsData = [['Plants', 'Animals'], ['Ficus', 'Goat'], ['Basil', 'Cat'], ['Moss', 'Frog']];
  Logger.log(obj)
  body.insertParagraph(0, obj.title)
      .setHeading(DocumentApp.ParagraphHeading.HEADING3);
  body.insertParagraph(1, obj.text);
  var tempname = "POC: " + obj.name + " " + obj.email
  //Logger.log(tempname);
  body.insertParagraph(2, tempname);
  //table = body.appendTable(rowsData);
  //table.getRow(0).editAsText().setBold(true);
}


function doGet(){
  process_entries()
  return HtmlService.createHtmlOutput('<a href="https://docs.google.com/document/d/your-google-doc-ID-goes-here-when-deployed/edit">view output</a>')
}
