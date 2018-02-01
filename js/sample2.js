(function(self){
    /**
 * Start CernerA11Y.js
 */

/*
    Function to create popup
*/

var mouseX   = 0;
var mouseY   = 0;
var screen   = "";

runA11AuditForUI =function (results){
	//var reportDetails = getReport(results);
	sessionStorage.setItem('cernerA11YResult',null);
	sessionStorage.setItem('cernerA11Y-issueType', null);

	showPopupStatus(results);

	//highlightViolations(reportDetails.reportDetailsList);
}

self.createPopup = function (){
	var popupDiv = document.createElement('div');
    popupDiv.id = "CernerA11Y-wrapper";
	popupDiv.className = "showing-settings statusArea";

	/**
    * Appending Font Awesome CSS file
    */
    var styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.type = 'text/css';
    styles.href = 'https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css';
	document.getElementsByTagName('head')[0].appendChild(styles);

	var popupHeader = '<div class="CernerA11Y-header" title="Using standard WCAG2AA">CERNER A11Y<div id="closeBtn" class="CernerA11Y-close" title="Close"> X </i></div></div><hr/><div id="" class="CernerA11Y-settings"></div>';
	popupDiv.innerHTML = popupHeader; 

	document.body.appendChild(popupDiv);

	var popupStatusDiv =document.querySelector('#CernerA11Y-wrapper.statusArea .CernerA11Y-settings');
	popupStatusDiv.innerHTML = getResultProcessingHtml();
	addDraggableListeners('statusArea');
	closePopup();
}

getResultProcessingHtml = function (){
	return '<div id="standards"><h1>Processing Results from AXE</h1></div><div class="issues"><img src="https://media.giphy.com/media/fOTJAGGyXu3Je/source.gif" style="height:100px;width:150px;" alt="Processing Image"></div>';
}

showPopupStatus = function (result){
    if(!result){
        result = JSON.parse(sessionStorage.getItem('cernerA11YResult'));
    }
    buildStatusArea(result);
}

/*
    Function to remove popup on click of close button
*/
removePopup = function (){
    var oldPopUp = document.querySelectorAll('#CernerA11Y-wrapper');

    for(var i=0;i<oldPopUp.length;i++){
        var parentElement = oldPopUp[i].parentElement;

        parentElement.removeChild(oldPopUp[i]);
    }
}

/*
    Function to create array of particular property
*/
pluck = function (array, propertyName) {
    var ret = [],
        i, ln, item;

    for (i = 0, ln = array.length; i < ln; i++) {
        item = array[i];

        ret.push(item[propertyName]);
    }

    return ret;
}

/**
 * Close Event
 */
closePopup = function (){
    var closeBtn = document.querySelectorAll('#CernerA11Y-wrapper #closeBtn');

    for(var i=0;i<closeBtn.length;i++){
        closeBtn[i].onmousedown = removePopup;
    }
}

/**
 * Function to assign click event for Home Button
 */
navigateToHome = function (){
    var homeIcons = document.querySelectorAll('li i.fa.fa-home');

    for(var i=0;i<homeIcons.length;i++){
        homeIcons[i].onmousedown = onClickHome;
    }
}

/**
 * Function to navigate to status screen
 */
onClickHome = function (){
    var statusArea  = document.querySelector('#CernerA11Y-wrapper.statusArea');
    var resultArea  = document.querySelector('#CernerA11Y-wrapper.resultArea');
    var summaryArea = document.querySelector('#CernerA11Y-wrapper.summaryArea');


    /* Make the home screen visible */
    statusArea ? (statusArea.style.display = "block") : showPopupStatus();
    screen = "statusArea";

    /* Remove the result and summary area */
    resultArea ? resultArea.parentElement.removeChild(resultArea) : null;
    summaryArea ? summaryArea.parentElement.removeChild(summaryArea) : null;
}



addDraggableListeners = function (screenType){
    var targetElm = '.'+screenType+' .CernerA11Y-header';

    screen = screenType;

    var header = document.querySelector(targetElm);
    header.addEventListener('mousedown', mouseDown, false);
    window.addEventListener('mouseup', mouseUp, false);

}

mouseUp = function (){
    dragging = false;
    window.removeEventListener('mousemove', divMove, true);
}

mouseDown = function (e){
    mouseX   = e.clientX;
    mouseY   = e.clientY;
    dragging = true;

    window.addEventListener('mousemove', divMove, true);
}

divMove = function (e){
    var targetElm = '#CernerA11Y-wrapper.'+screen;

	var div = document.querySelector(targetElm);
	
	if(div){
		var top = div.offsetTop;
		var left = div.offsetLeft;
	
		if (mouseY < e.clientY) {
			top += (e.clientY - mouseY);
			div.style.top = top + 'px';
		} 
		else if (mouseY > e.clientY) {
			top -= (mouseY - e.clientY);
			div.style.top = top + 'px';
		}
	
		if (mouseX < e.clientX) {
			left += (e.clientX - mouseX);
			div.style.left = left + 'px';
		} 
		else if (mouseX > e.clientX) {
			left -= (mouseX - e.clientX);
			div.style.left = left + 'px';
		}
	
		mouseX = e.clientX;
		mouseY = e.clientY;
	}
}

testIframes = function (iframes,iframeResults){
    for(var i=0;i<iframes.length;i++){
        var elements = iframes[i].contentDocument.body ? iframes[i].contentDocument.body.querySelectorAll('*') : [];

		if(elements.length){
			elements = getIframeElements(elements);
				axe.a11yCheck(elements,{
					exclude: [['#CernerA11Y-wrapper']]
					},function(res){
						let distinctClassName = "cernera11y-iframe"+iframes[i].parentIndex;
						iframes[i].className += ((iframes[i].className!="")?(" "+distinctClassName):"");
						res.distinctClassName = distinctClassName;
						iframeResults.push(res);
						
						console.log('Tested Iframe : ',iframes[i]);
						console.log('iframeResults :'+i+ ": " +JSON.stringify(res.violations));
					});
			}
    }
}

getConsolidatedResults = function (finalResult,iframeResults,standardSelected){
    standardSelected = standardSelected?standardSelected:null;
    var finalResultNodes = pluck(finalResult.violations,'nodes');
    
        for(var i=0;i<finalResultNodes.length;i++){
            for(var j=0;j<finalResultNodes[i].length;j++){
                finalResultNodes[i][j].parentClass = null;
            }
        }

		for(var i=0;i<iframeResults.length;i++){
			var passes = iframeResults[i].passes;
			var violations = iframeResults[i].violations;
			var incomplete = iframeResults[i].incomplete;
			var inapplicable = iframeResults[i].inapplicable;
			var distinctClassName = iframeResults[i].distinctClassName;
            var iframeResultNodes = pluck(violations,'nodes');
			/**
			 * Adding parent class for iframe violations to get the correct target later
			 */

            for(var i=0;i<iframeResultNodes.length;i++){
                for(var j=0;j<iframeResultNodes[i].length;j++){
                    iframeResultNodes[i][j].parentClass = distinctClassName;
                }
            }

			var existingViolationIds = pluck(finalResult.violations,'id');
			for(var j=0;j<violations.length;j++){
				//violations[j].parentClass = distinctClassName;
				var index = existingViolationIds.indexOf(violations[j].id);
				if(index >= 0){
					finalResult.violations[index].nodes = finalResult.violations[index].nodes.concat(violations[j].nodes);
				}
				else{
					finalResult.violations.push(violations[j]);
				}
			}
		}

	standardSelected ? buildStatusArea(finalResult,standardSelected) : runA11AuditForUI(finalResult);
}


getIframeElements = function (elements){
    var elementsClone = [];
    
    for(var i=0;i<elements.length;i++){
        if(elem.length){
            var child = elem.childNodes;
            for(var j=0;j<child.length;j++){
                if(child[j].nodeName != "#text"){
                    elementsClone.push(child[j]);
                }
            }
        }else{
            elementsClone.push(elem);
        }
    }

	return elementsClone;
}

getAllIframes = function (doc,iframes,iframeIndex){
	iframes = iframes?iframes:[];


	let iframeInDocument = ((doc == "mainDoc")?document.querySelectorAll('iframe'):doc.querySelectorAll('iframe'));


	if(iframeInDocument.length){
        //iframes = iframes.concat(iframeInDocument);
        for(var i=0;i<iframeInDocument.length;i++){
            if(doc == "mainDoc"){
				iframeInDocument[i].parentIndex = i;
				iframeIndex = i;
			}
			else if(String(iframeIndex)){
				iframeIndex = String(iframeIndex)+i;
				iframe.parentIndex = iframeIndex;
			}

			var iframeSrc = iframeInDocument[i].src;
			var iframeHost = (iframeSrc=="" ? '' : iframeSrc.split('/')[2]);
			var documentHost = window.location.host;

		/**
		* Restricting Iframe testing for cross-domain due to
		* security restrictions while reading iframe's document.
		*/
			if(iframeHost == documentHost || iframeSrc == ''){
				iframes.push(iframeInDocument[i]);
				var iframeDoc = iframeInDocument[i].contentDocument;

				var iframeInIframe = getAllIframes(iframeDoc,iframes,iframeIndex);
				if(iframeInIframe.length){
                    for(var j=0;j<iframeInIframe.length;j++){
                        if(iframes.indexOf(iframeInIframe[j])<0){
							iframes.push(iframeInIframe[j]);
						}
                    }
				}
			}
        }
	}

	return iframes;
}

/**
 * End cernerA11Y.js
 */


 /**
  * Start statusScreen.js
  */
  buildStatusArea = function (result,standardSelected) {
    sessionStorage.setItem('cernerA11YResult', JSON.stringify(result));

    var popupStatusDiv =document.querySelector('#CernerA11Y-wrapper.statusArea .CernerA11Y-settings');

    /* Update result in the Popup */
    popupStatusDiv.innerHTML = getStatusAreaHtml(result,standardSelected);

    setStatusAreaEvents();
}

getStatusAreaHtml = function (result,standardSelected) {
    var violations = result.violations;
    var passes = result.passes;
    var incomplete = result.incomplete;
    var availableStandards = ['wcag2a','wcag2aa','section508','best-practice'];
    var optionList='<option value=select>-SELECT-</option>';

    for(var i=0;i<availableStandards.length;i++){
        if(availableStandards[i] == standardSelected){
            optionList += '<option value='+availableStandards[i]+'  selected>'+availableStandards[i].toUpperCase()+'</option>';
        }else{
            optionList += '<option value='+availableStandards[i]+'>'+availableStandards[i].toUpperCase()+'</option>';
        } 
    }

    return '<div id="" class="CernerA11Y-settings"> <div id="standards"> <select name="" id="selectStandard">'+ optionList +'</select> </div><div class="issues"> <div id="violations"> <a class="btn violationBtn"> <span class="txt"> Violations : '+violations.length+'</span> <span class="round"><i class="fa fa-chevron-right"></i></span> </a> </div><div id="passes"> <a class="btn passesBtn"> <span class="txt">Passes : '+passes.length+' </span> <span class="round"><i class="fa fa-chevron-right"></i></span> </a> </div><div id="incomplete"> <a class="btn incompleteBtn"> <span class="txt"> Incomplete : '+incomplete.length+'</span> <span class="round"><i class="fa fa-chevron-right"></i></span> </a> </div></div></div>';
}

setStatusAreaEvents = function () {
    onChangeStandards();
    showResult();
    navigateToHome();
};

onChangeStandards = function (){
    var a11yStandards = document.querySelector('.CernerA11Y-settings select');

    a11yStandards.onchange = function(e){
        var standardSelected = e.currentTarget.value;

    /**
     * Re-test the document against the standard selected
     */
        if(standardSelected != 'select'){
            var popupStatusDiv =document.querySelector('#CernerA11Y-wrapper.statusArea .CernerA11Y-settings');
            popupStatusDiv.innerHTML = getResultProcessingHtml();
            
            var iframes = getAllIframes("mainDoc");
  
            var iframeResults = [];
            var finalResult;
    
            if(iframes.length){
              axe.a11yCheck({
                  exclude: [['#CernerA11Y-wrapper']]
                },{
                    runOnly: {
                        type: "tag",
                        values: [standardSelected]
                      }
                },function(res){
                  finalResult = res;
                  console.log('documentResult : '+JSON.stringify(res.violations));
      
                  testIframes(iframes,iframeResults);
                  /**
                   * Added timeout to get results from main document as well as iframes.
                   */
                  setTimeout(function(){
                      getConsolidatedResults(finalResult,iframeResults,standardSelected);
                  },10000);
              });
            }else{
              axe.a11yCheck({
                  exclude: [['#CernerA11Y-wrapper']]
                },{
                    runOnly: {
                        type: "tag",
                        values: [standardSelected]
                      }
                },function(result){
                    buildStatusArea(result,standardSelected);
                });
            }
        }
    }
}
reRunA11AuditForUI = function (result,standardSelected){
    // var issuesBtn = document.querySelectorAll('#CernerA11Y-wrapper .CernerA11Y-settings .txt');

    // sessionStorage.setItem('cernerA11YResult', JSON.stringify(result));

    // issuesBtn[0] && (issuesBtn[0].innerText = ' Violations : ' + result.violations.length);
    // issuesBtn[1] && (issuesBtn[1].innerText = ' Passes : ' + result.passes.length);
    // issuesBtn[2] && (issuesBtn[2].innerText = ' Incomplete : ' + result.incomplete.length);
}

showResult = function () {
    var issueBtns = document.querySelectorAll('#CernerA11Y-wrapper .CernerA11Y-settings a');

    for(var i=0;i<issueBtns.length;i++){
        issueBtns[i].onmousedown = function (e) {
            var issueType = e.currentTarget.parentElement.id;

            sessionStorage.setItem('cernerA11Y-issueType', issueType);
    
            var issues = JSON.parse(sessionStorage.getItem('cernerA11YResult'))[issueType];
            //JSON.parse(sessionStorage.getItem('cernerA11YResult')).passes
            //JSON.parse(sessionStorage.getItem('cernerA11YResult')).incomplete
    
            var statusArea = document.querySelector('#CernerA11Y-wrapper.statusArea');
            
            var top  = statusArea.offsetTop;
            var left = statusArea.offsetLeft;
    
            statusArea ? (statusArea.style.display = "none") : null;
    
            var resultDiv = document.createElement('div');
            resultDiv.id = "CernerA11Y-wrapper";
            resultDiv.className = "showing-issue-list resultArea";
            
            resultDiv.style = "top:"+ top+"px; left:"+left+"px;";
    
            //var violation = JSON.parse(contentArea.getAttribute('violation'));
    
           //var violation = JSON.parse(sessionStorage.getItem('cernerA11YResult')).violations;
            var newHtml = buildResultArea(issueType, issues);
    
            resultDiv.innerHTML = newHtml;
    
            document.body.appendChild(resultDiv);
    
            var resultArea = document.querySelector('#CernerA11Y-wrapper.showing-issue-list');
            var lis = resultArea.querySelectorAll('li.CernerA11Y-violation');
    
            for (var i = 0; i < lis.length; i++) {
                lis[i].setAttribute('index', i);
            }
    
            setResultAreaEvents(issueType);
        }
    }
}
   /**
  * End statusScreen.js
  */

 /**
  * Start resultScreen.js
  */
  buildResultArea =  function (issueType,issues){
    var issueList = [];
  
    for(var i=0;i<issues.length;i++){
      var liHtml = '<li id="CernerA11Y-msg-'+i+1+'" class="CernerA11Y-violation"><span class="CernerA11Y-issue-type CernerA11Y-result" title="Error"><i class="fa fa-exclamation-circle fa-5x" style="padding-left: 20%;">'+"  "+(i+1)+"  "+'</i></span><span class="CernerA11Y-issue-title">'+issues[i].description.replace(/[<>]/g,"")+'</span></li>';
    
      issueList.push(liHtml);
    }
  
    var resultHTML = '<div class="CernerA11Y-header" title="Using standard WCAG2AA">CERNER A11Y <div id="closeBtn" class="CernerA11Y-close" title="Close"> X </div></div><div class="CernerA11Y-summary"> <div class="CernerA11Y-summary-left"> <ol class="CernerA11Y-list"> <li class="CernerA11Y-list-item clickableItem"><i class="fa fa-home fa-5x"></i><span>Home</span></a></li><li class="CernerA11Y-list-item"><strong>'+issues.length+'</strong>'+" : " + issueType.toUpperCase() +'</li></ol> </div><div class="CernerA11Y-summary-right">&nbsp;</div></div><div class="CernerA11Y-outer-wrapper"> <div id="CernerA11Y-issues-wrapper" class="CernerA11Y-inner-wrapper"> <div id="CernerA11Y-issues" class="CernerA11Y-details"> <ol class="CernerA11Y-issue-list" style="margin-left: 0; list-style-type: decimal;">' + issueList + '</ol> </div></div></div>';
  
  
  return resultHTML;
  }
  
  setResultAreaEvents =  function (issueType){
    addDraggableListeners('resultArea');
    onClickViolations(issueType);
    closePopup();
    navigateToHome();
  }

  onClickViolations = function (issueType){
    var violationDiv = document.querySelectorAll('li.CernerA11Y-violation')
    
    for(var i=0;i<violationDiv.length;i++){
        violationDiv[i].setAttribute('issueType',issueType);
        violationDiv[i].onmousedown = function(e,li){
            var issueType = e.currentTarget.getAttribute('issueType');
            var issue = JSON.parse(sessionStorage.getItem('cernerA11YResult'))[issueType];
            var issueIndex = Number(e.currentTarget.getAttribute('index'));
            var data = issue[issueIndex];
            var targets = pluck(data.nodes,'target');
            var resultArea = document.querySelector('#CernerA11Y-wrapper.resultArea');
            var summaryArea = document.querySelector('#CernerA11Y-wrapper.summaryArea');


            var top  = resultArea.offsetTop;
            var left = resultArea.offsetLeft;

            resultArea ? (resultArea.style.display = "none") : null;
            
            // targets.forEach(function(n){
            //     console.log(document.querySelector(n[0]));
            //     document.querySelector(n[0]).style.outline="2px dashed red";
            // });

          /**
           * If summary area is present, destroy it and create a new one for selected issue
           */
          if(summaryArea && (summaryArea.style.display == "none")){
            summaryArea.parentElement.removeChild(summaryArea);
          }
            var summaryDiv = document.createElement('div');
            summaryDiv.id = "CernerA11Y-wrapper";
            summaryDiv.className = "showing-issue-list summaryArea";

            summaryDiv.style = "top:"+ top+"px; left:"+left+"px; height: 85%; width: fit-content;";
 
            resultArea.style.display = "none";
            var selectedIndex = Number(issueIndex)+1;
            var summaryAreaHtml = buildSumaryArea(data,selectedIndex,issue.length);
      
            summaryDiv.innerHTML = summaryAreaHtml;
      
            document.body.appendChild(summaryDiv);
 
            setSummaryAreaEvents(e.currentTarget, selectedIndex, issue.length);
        }
    }
  }
   /**
  * End resultScreen.js
  */

 /**
  * Start summaryScreen.js
  */
  var highlightedElement;
  buildSumaryArea = function (data, currentCount, total){
      var issueType = sessionStorage.getItem('cernerA11Y-issueType');
  
      var summaryArea = '<div class="CernerA11Y-header" title="Cerner A11Y">Cerner A11Y <div id="closeBtn" class="CernerA11Y-close" title="Close"> X </div></div><div class="CernerA11Y-summary-detail" style="display: block;"> <div class="CernerA11Y-summary-left"> <ol class="CernerA11Y-list clickableItem"> <li class="CernerA11Y-list-item"> <i class="fa fa-home fa-5x"></i> <span>Home</span> </li><li id="violationLink" class="CernerA11Y-list-item clickableItem"> <i class="fa fa-file-text fa-5x"></i> <span>'+ issueType.toUpperCase() +'</span> </li><li id="displayCount" class="CernerA11Y-list-item">Showing '+ (Number(currentCount)) +' of '+ total +'</li></ol> </div><div class="CernerA11Y-summary-right"> <div class="CernerA11Y-button-group"> <div id="CernerA11Y-button-previous-issue" class="CernerA11Y-button" title="Previous Issue"> <span class="CernerA11Y-button-icon"><i class="fa fa-arrow-circle-left fa-5x"></i></span>&nbsp; </div>'+
      '<div id="CernerA11Y-button-next-issue" class="CernerA11Y-button" title="Next Issue"> <span class="CernerA11Y-button-icon"><i class="fa fa-arrow-circle-right fa-5x"></i></span>&nbsp; </div></div></div></div><div class="CernerA11Y-outer-wrapper" style="overflow: auto;height: 90%;"> <div id="CernerA11Y-issues-detail" class="CernerA11Y-details" style="overflow:visible;"> <ol class="CernerA11Y-issue-detail-list" style="margin-left: 0;list-style-type: decimal;"> <li id="CernerA11Y-violation-summary" class=" CernerA11Y-current" style="margin-left: 0px;">'+ getSelectedViolationSummary(currentCount,total) +'</li></ol> </div></div>';
  
      return summaryArea;
  }
  
  setSummaryAreaEvents = function (selectedViolation, selectedIndex, total){
      addDraggableListeners('summaryArea');
      onClickIssueArrowButton(selectedIndex,total);
      onClickTarget(selectedIndex);
      onClickTargetArrowButton(selectedIndex);
      closePopup();
      navigateToResult();
      navigateToHome();
  }
  
  onClickIssueArrowButton = function (selectedIndex,total){
      var previousBtn = document.getElementById('CernerA11Y-button-previous-issue');
      var nextBtn =  document.getElementById('CernerA11Y-button-next-issue');
  
      enableDisableBtn(selectedIndex,total,'issue');
  
      previousBtn.onmousedown = function(e){
          var currentCount = Number(e.currentTarget.getAttribute('selectedIndex'));
          var totalCount = Number(e.currentTarget.getAttribute('totalCount'));
          var newCount;
  
          if((currentCount)!=1){
              var summaryContainer = document.getElementById('CernerA11Y-violation-summary');
              newCount = currentCount-1;
  
              summaryContainer.innerHTML = getSelectedViolationSummary(newCount);
              enableDisableBtn(newCount,totalCount,'issue');
              onClickTarget(newCount);
              onClickTargetArrowButton();
              document.getElementById('displayCount').innerHTML = 'Showing '+ (Number(newCount)) +' of '+ totalCount;
          }
      }
  
      nextBtn.onmousedown = function(e){
          var currentCount = Number(e.currentTarget.getAttribute('selectedIndex'));
          var totalCount = Number(e.currentTarget.getAttribute('totalCount'));
          var newCount;
  
          if((currentCount)!=total){
              var summaryContainer = document.getElementById('CernerA11Y-violation-summary');
              newCount = currentCount+1;
  
              summaryContainer.innerHTML = getSelectedViolationSummary(currentCount+1);
              enableDisableBtn(currentCount+1,totalCount,'issue');
              onClickTarget(currentCount+1);
              onClickTargetArrowButton();
              document.getElementById('displayCount').innerHTML = 'Showing '+ (Number(newCount)) +' of '+ totalCount;
          }
      }
  }
  
  enableDisableBtn = function (selectedIndex, total, type){
      if(type == 'target'){
          var previousBtn = document.getElementById('CernerA11Y-button-previous-target');
          var nextBtn     = document.getElementById('CernerA11Y-button-next-target');
      }
      else if(type == "issue"){
          var previousBtn = document.getElementById('CernerA11Y-button-previous-issue');
          var nextBtn     =  document.getElementById('CernerA11Y-button-next-issue');
  
          previousBtn.setAttribute('selectedIndex',selectedIndex);
          nextBtn.setAttribute('selectedIndex',selectedIndex);
          previousBtn.setAttribute('totalCount',total);
          nextBtn.setAttribute('totalCount',total);
      }
  
      if(Number(total) == 1){
          previousBtn.style.opacity = 0.5;
          previousBtn.style.cursor  = "auto";
          nextBtn.style.opacity     = 0.5;
          nextBtn.style.cursor      = "auto";
      }
      else if(Number(selectedIndex) == 1){
          previousBtn.style.opacity = 0.5;
          previousBtn.style.cursor  = "auto";
          nextBtn.style.opacity     = 1;
          nextBtn.style.cursor      = "pointer";
      }
      else if(Number(selectedIndex) == total){
          previousBtn.style.opacity = 1;
          previousBtn.style.cursor  = "pointer";
          nextBtn.style.opacity     = 0.5;
          nextBtn.style.cursor      = "auto";
      }
      else if(Number(selectedIndex) > 1 && Number(selectedIndex) < total){
          previousBtn.style.opacity = 1;
          previousBtn.style.cursor  = "pointer";
          nextBtn.style.opacity     = 1;
          nextBtn.style.cursor      = "pointer";
      }
  }
  
  onClickTargetArrowButton = function  (){
      var previousTargetBtn = document.getElementById('CernerA11Y-button-previous-target');
      var nextTargetBtn     = document.getElementById('CernerA11Y-button-next-target');
  
      previousTargetBtn.onmousedown = function(e){
          var selectedTargetIndex = Number(e.currentTarget.getAttribute('selectedTargetIndex'));
          var targetListItems     = document.querySelectorAll('li.targetListItems');
          var totalTarget         = targetListItems.length;
          var selectedTarget      = targetListItems[selectedTargetIndex];
          var targetDetailsDiv    = document.getElementById('targetLocator');
          var targetHtml          = targetDetailsDiv.querySelector('.CernerA11Y-issue-source-inner strong');
          
  
          if(selectedTargetIndex > 0){
              var newTargetIndex = selectedTargetIndex-1;
              var newTarget = targetListItems[newTargetIndex];
              enableDisableBtn(newTargetIndex, totalTarget,'target');
  
              newTarget.onmousedown({currentTarget:newTarget});
          }
      }
  
      nextTargetBtn.onmousedown = function(e){
          var selectedTargetIndex = Number(e.currentTarget.getAttribute('selectedTargetIndex'));
          var targetListItems     = document.querySelectorAll('li.targetListItems');
          var totalTarget         = targetListItems.length;
          var selectedTarget      = targetListItems[selectedTargetIndex];
          var targetDetailsDiv    = document.getElementById('targetLocator');
          var targetHtml          = targetDetailsDiv.querySelector('.CernerA11Y-issue-source-inner strong');
          
  
          if((selectedTargetIndex < targetListItems.length-1) && (selectedTargetIndex != targetListItems.length-1)){
              var newTargetIndex = selectedTargetIndex+1;
              var newTarget = targetListItems[newTargetIndex];
              enableDisableBtn(newTargetIndex, totalTarget,'target');
  
              newTarget.onmousedown({currentTarget:newTarget});
          }
      }
  }
  
  getSelectedViolationSummary = function (selectedIndex){
    var issueType = sessionStorage.getItem('cernerA11Y-issueType');
    var issue = JSON.parse(sessionStorage.getItem('cernerA11YResult'))[issueType];
    var data = issue[selectedIndex-1];
  
    var issueSummaryHtml = '<div class="CernerA11Y-issue-details"> <div class="CernerA11Y-issue-title CernerA11Y-issue-wcag-ref" style="margin:10px;"> <em>Description:</em><span style="color:black;">' +data.description.replace(/[<>]/g,"")+ '</span></div><div class="CernerA11Y-issue-wcag-ref" style="margin:10px;"> <em>Help:</em> <span style="color:black;">'+data.help.replace(/[<>]/g,"")+'</span> <br><em>Help URL:</em> <a href='+data.helpUrl.replace(/[<>]/g,"")+' target="_blank" style="color:black;">'+data.helpUrl+'H25</a> <br></div></div><div id="violation-summary-details" class="CernerA11Y-issue-source CernerA11Y-issue-wcag-ref" style="margin:10px;"> <div class="CernerA11Y-issue-source-inner-u2p targetDisplayArea"> <div class="CernerA11Y-issue-source-header"> <strong>Target List</strong> </div><br/> <ol style="margin-left:7%; list-style-type: decimal;">' +getTargetList(data.nodes)+
    '</ol> <div id="targetLocator" class="CernerA11Y-issue-source" style="display:none;"> <div class="CernerA11Y-issue-source"> <div class="CernerA11Y-issue-source-header" style="height:10px;"> <strong>Code Snippet</strong> <div class="CernerA11Y-summary-right"> <div class="CernerA11Y-button-group"> <div id="CernerA11Y-button-previous-target" class="CernerA11Y-button" title="Previous Target"> <span class="CernerA11Y-button-icon"><i class="fa fa-arrow-circle-left fa-5x"></i></span>&nbsp; </div><div id="CernerA11Y-button-next-target" class="CernerA11Y-button" title="Next Target"> <span class="CernerA11Y-button-icon"><i class="fa fa-arrow-circle-right fa-5x"></i></span>&nbsp; </div></div></div></div><br/> <div class="CernerA11Y-issue-source-inner"> <span><i class="fa fa-thumb-tack fa-5x locator" style="cursor:pointer;"></i></span> <strong> Html of selected Target </strong> </div></div></div></div></div>';
  
    return issueSummaryHtml;
  }
  
  getTargetList = function (nodes){
    var targetList = pluck(nodes,'target');
    var targetListHtml;
  
    for(var i=0;i<targetList.length;i++){
        if(targetListHtml){
            targetListHtml += ('<li class="targetListItems" style="list-style: unset;">'+(targetList[i])[0]+'</li>');
        }
        else{
          targetListHtml = '<li class="targetListItems" style="list-style: unset;">'+(targetList[i])[0]+'</li>';
        }
    }
  
    return targetListHtml;
  }
  
  onClickTarget = function (selectedIndex){
      var targetListItems = document.querySelectorAll('li.targetListItems');
  
      for(var i=0;i<targetListItems.length;i++){
        var issueType = sessionStorage.getItem('cernerA11Y-issueType');
        var issue = JSON.parse(sessionStorage.getItem('cernerA11YResult'))[issueType];
        var issueIndex = (selectedIndex-1);
        var data = issue[issueIndex];
        var parentClass = pluck(data.nodes,'parentClass');
        var htmlList   = pluck(data.nodes,'html');

        targetListItems[i].setAttribute('html',htmlList[i]);
        targetListItems[i].setAttribute('targetIndex',i);
        if(parentClass[i]){
            targetListItems[i].setAttribute('parentClass',parentClass[i]);
        }
        
        targetListItems[i].setAttribute('target',targetListItems[i].innerText);
        targetListItems[i].onmousedown = function(e){
                var targetDetailsDiv     = document.getElementById('targetLocator');
                var summaryAreaDetail    = document.querySelector('#CernerA11Y-wrapper.summaryArea div.CernerA11Y-summary-detail');
                var targetHtml           = targetDetailsDiv.querySelector('.CernerA11Y-issue-source-inner strong');
                var totalTargetListItems = document.querySelectorAll('li.targetListItems').length;
                var targetHeader         = targetDetailsDiv.querySelector('strong');
                var selectedTargetIndex  = Number(e.currentTarget.getAttribute('targetIndex'));

                var previousTargetBtn = document.getElementById('CernerA11Y-button-previous-target');
                var nextTargetBtn     = document.getElementById('CernerA11Y-button-next-target');

                //Update Target count with the selected target
                targetHeader.innerHTML = "Code Snippet : "+(selectedTargetIndex+1);
                previousTargetBtn.setAttribute('selectedTargetIndex',selectedTargetIndex);
                nextTargetBtn.setAttribute('selectedTargetIndex',selectedTargetIndex);

                enableDisableBtn(selectedTargetIndex+1, totalTargetListItems, 'target');

                summaryAreaDetail.style.display = "none";


                /**
                 * Replace the Html with selected target Html
                 */
                targetHtml.innerHTML = e.currentTarget.getAttribute('html').replace(/</g,'&lt; ').replace(/>/g,' &gt; ');

                targetDetailsDiv.style.display = "block";
                targetDetailsDiv.scrollIntoView();

                summaryAreaDetail.style.display = "block";

                var locationBtn = document.querySelector('#targetLocator i.locator');

                locationBtn.setAttribute('target',e.currentTarget.getAttribute('target'));
                locationBtn.setAttribute('parentClass',e.currentTarget.getAttribute('parentClass'));
                locationBtn.onmousedown = locateTarget;
            }
      }
  }
  
  locateTarget = function (e){
      var target = e.currentTarget.getAttribute('target');
      var parentClass = e.currentTarget.getAttribute('parentClass');
  
      if(parentClass && parentClass!="null"){
          var indexSequence = parentClass.split('cernera11y-iframe')[1].split('');
          var iframeDoc;
      
          for(let i=0;i<indexSequence.length;i++){
              if(indexSequence.length == 1 && i==0){
                  iframeDoc = document.querySelectorAll('iframe')[Number(indexSequence[i])];
              }
              else if(indexSequence.length>1 && i==0){
                  iframeDoc = document;
              }
              else{
                  iframeDoc = parentDoc.contentDocument.querySelectorAll('iframe')[Number(indexSequence[i])];
              }
      
              parentDoc = iframeDoc.querySelectorAll('iframe')[Number(indexSequence[i])];
          }
          
          elmnt =  (iframeDoc.contentDocument && iframeDoc.contentDocument.querySelector(target));
      }
      else{
          elmnt =  document.querySelector(target);
      }
  
      
      if(target == 'html'){
          elmnt.style.margin = '5px';
      }
  
      //If element exists, highlight the border with red color
      if(elmnt){
          elmnt.scrollIntoView({behavior: "instant", block: "center", inline: "nearest"});
      
          var borderClr = "";
          var counter = 0;
      
          /**
           * To remove the outline of already highlighted element
           */
          if(highlightedElement && highlightedElement.style.outline == "red dashed 2px"){
              highlightedElement.style.outline = "";
          }
          
          highlightedElement = elmnt;
      
          var highlightingBorder = setInterval(function(){
              if(counter<15){
                  borderClr = (borderClr=="2px dashed red")?"":"2px dashed red";
                  counter++;
                  elmnt.style.outline = borderClr;
              }else{
                  clearInterval(highlightingBorder);
                  elmnt.style.outline = "";
      
                  counter=0;
                  if(target == 'html'){
                      elmnt.style.margin = '';
                  }
              }
          },1000/2);
      }
  }
  
  navigateToResult = function (){
      var violationBtn = document.getElementById('violationLink');
  
      if(violationBtn){
          violationBtn.onmousedown = function(e){
              var resultArea = document.querySelector('#CernerA11Y-wrapper.resultArea');
              var summaryArea = document.querySelector('#CernerA11Y-wrapper.summaryArea');
          
              summaryArea ? (summaryArea.style.display = "none") : null;
              resultArea  ? (resultArea.style.display = "block") : null;
  
              screen = "resultArea";
          }
      }
  }
   /**
  * End summaryScreen.js
  */
})(this);