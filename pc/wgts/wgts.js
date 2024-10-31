///////////////////////////////////////////////////////////////////////////////
// ux.wgt.DIV
/*
	innerHTML의 편집을 지원하므로

	wgt.setData/getData
		HTML
			(이 위젯은 주로 외부에서 직접 innerHTML하므로 필요는 없느나 기능은 제공함)
*/

var xa = {}

xa.styleMap = {
	title:true
	,visibility:true
	,font:true, fontSize:true
	,alpha:true
	,angle:true
	,dragX:true, dragY:true, dragInParent:true, dragContainParent:true
}

xa.scriptInfo = {
	wgtData:{HTML:{help:{ko:"String\nDIV의 'innerHTML'에 지정할 HTML입니다.",en:"String\nHTML string to be set as 'innerHTML'."}}}
}

xa.editor = {
	iconThumb:'DB/ux/imgs/wgts/thumbs/tag.png'
}

xa.properties = {
	attrs:{
		HTML:''
	}
}

xa.createAsCanvasObject = apn.widgets['apn.wgt.rect'].createAsCanvasObject; //%INFO ADD할 경우가 없으므로 사용되지 않는 함수임
xa.exeRenderTag = apn.widgets['apn.wgt.rect'].exeRenderTag;
xa.exeCreateTag = apn.widgets['apn.wgt.rect'].exeCreateTag;

xa.exeOnLoad = function(apx, oId)
{
	this._htmlSet(apx, oId);

	var _this = this;

	//	HTML set, <body> TAG 및 <head> TAG에 해당하는 HTML를 지정합니다.
	function onSetHTML(changeWgtId, value)
	{
		if (changeWgtId == oId){
			_this._htmlSet(apx, oId);
		}
	}
	apx.wgtListenProperty(oId, 'HTML', onSetHTML);
}

xa.exeOnScreenRefresh = function(apx, oId, opts)
{
	var tag = apx.wgtTag(oId);

	// Text가 있으면 다시 Set함. Virtical Align 경우 Font의 크기에 영향을 받음
	var text, refresh = true;

	if (opts && opts.font && opts.font != apx.wgtGetProperty(oId, 'apxFont', /*Resolve*/true)) refresh = false; // Font가 다르면 Skip

	if (refresh){
		apx.fireEvent('contentChange', 'font', oId, /*always*/true);
	}
}

xa._htmlSet = function(apx, oId)
{
	var html;

	if ((html = apx.wgtGetProperty(oId, 'HTML'))){
		if (!apx.sptExeIsPreview() || apn.Project.getScriptVer(apx.project) == 2){
			apx.wgtTag(oId).innerHTML = html;
		}
		else{
			apx.wgtTag(oId).innerHTML = 'This is supporeted with Aspen Scripting Ver2.';
		}
	}
}

xa.edtOnCheckContentChange = function(prj, pId, oId)
{
	return {font:'Font'};
}

xa.edtOnConfig = function(/*CEditor*/apd, oId)
{
	var buf = {HTML:apd.wgtGetProperty(oId, 'HTML')};
	var tagDlg;

	function onOK1()
	{
		eduLib.edtInputApplyAll(apd, tagDlg);
		apd.wgtSetProperty(oId, 'HTML', buf.HTML);
		//apd.wgtRefreshUI(oId);
	}

	if (tagDlg = apd.dlgDoModal(Math.ceil(bx.UX.width*0.8), 760, onOK1)){
		eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:'HTML', join:true});
		eduLib.edtInputAdd(apd, tagDlg, {type:'text', value:buf, key:'HTML', multiline:true, height:'600px', join:true});
	}
}

uxWgtDIV = xa;
///////////////////////////////////////////////////////////////////////////////
// ux.wgt.btnImage (W:edu.wgt.btnStateS 기본으로 함)
/*
	Image + Border + Text로 구성된 Button임
*/
var xa = apn.inheritWidget(apn.widgets['apn.wgt.image2']);
xa.exeFireStateEvent = true;

xa.styleMap = {
	title:true
	,visibility:true
	,strokeStyle:true, lineWidth:true, lineDash:true
	//,fillStyle:true
	,font:true, fontSize:true, fontStyle:true, fontItalic:true, fontBold:true, textMultiLine: true, fontUnderlined:true
	,text:true,	textAlign:true, textValign:true, textPadding:true
	,fontStrokeStyle:true, fontStrokeWidth:true
	,borderRadiusTopLeft:true, borderRadiusTopRight:true, borderRadiusBottomLeft:true, borderRadiusBottomRight:true
	,alpha:true
	,angle:true
	,mediaID:true
	,dragX:true, dragY:true, dragInParent:true, dragContainParent:true
	,csr:true
}
//xa.apnWgtImg2DOM2 = true;

xa.editor = {}; //%%INFO image2의 것이 있으면 무시하고 구성함. 이것을 image2의 정보를 사용할 정도로 관련성이 없는 위젯임.
xa.editor.iconThumb = 'DB/ux/imgs/wgts/thumbs/imageButton.png';

/*	Image를 set할 수 있도록 하기 위한 것이며, 일단 이 위젯이 직접적으로 사용되는
	''=normal, 'check', 'tab'
	에 대해서 지원함
*/
xa._txtSpt1 = {ko:"기본 상태 이미지 ID", en:"Image asset ID for normal state", ja:"基本状態の画像ID"};
xa._txtSpt2 = {ko:"선택 상태 이미지 ID", en:"Image asset ID for selected state", ja:"選択状態の画像ID"};

xa.scriptInfo = {
	wgtDataByParam:'selectType'
	,wgtData:{
		'':{
			/*	%%INFO
				undefined가 아닌 항목만 지정됩니다. 따라서 반복 호출도 가능합니다.
				또한, 교체 목적입니다. 위젯은 이미지 구성에 따라서 동작이 다르므로, 기존의 것을 교체하기 위한 목적입니다
			*/
			image:{help:"{normal:ID|undefined, pressed:ID|undefined, hover:ID|undefined}\n"+apn.CExe.GL(xa._txtSpt1), type:'so', value:{}}
			,imageDisabled:{help:"{normal:ID|undefined}\n"+apn.CExe.GL({ko:"비활성 상태 이미지 ID", en:"Image asset ID for disabled state", ja:"非アクティブの画像ID"}), type:'so', value:{}}
		}
		,tab:{
			image:{help:"{normal:ID|undefined, hover:ID|undefined}\n"+apn.CExe.GL(xa._txtSpt1), type:'so', value:{}}
			,imageSelected:{help:"{normal:ID|undefined}\n"+apn.CExe.GL(xa._txtSpt2), type:'so', value:{}}
		}
		,check:{
			image:{help:"{normal:ID|undefined, hover:ID|undefined}\n"+apn.CExe.GL({ko:"미선택 상태 이미지 ID", en:"Image asset ID for unchecked state", ja:"未選択状態の画像ID"}), type:'so', value:{}}
			,imageChecked:{help:"{normal:ID|undefined, hover:ID|undefined}\n"+apn.CExe.GL(xa._txtSpt2).replace('selected', 'checked'), type:'so', value:{}}
		}
	}
}

/*	2017/09/13
		btnV=2
		1. Setup된 Text color가 Border color에도 적용되도록 함
		2. 'btnType'값이 추가되어 'text'이면 Image를 사용하지 않고 Text로만 동작함
*/
xa.properties.state = 'normal';
xa.properties.attrs = xa.properties.attrs || {};
xa.properties.attrs.selectType = '';
xa.properties.attrs.btnV = 2;
xa.properties.attrs.autoKeepSize = false;
xa.properties.attrs.cfg = {
	images:{
		normal:{mediaID:undefined}, down:{mediaID:undefined}, hover:{mediaID:undefined} /*Normal*/
		,disabled:{mediaID:undefined}, disabledDown:{mediaID:undefined}, disabledHover:{mediaID:undefined} /*Disabled, Disabled-select*/
		,checked:{mediaID:undefined}, checkedD:{mediaID:undefined}, checkedH:{mediaID:undefined} /*Checked, down은 필요가 없으나 편의상 정의함. normal이 이것의 down이 되기 때문에*/
	}
	,clr:{disabled:null, down:null, hover:null}
	,ttip:'' // Tooltip
	,hvrSync:'' // Hover sync group - Button들이 Hover 상태를 고유하기 위한 기능. 양면책 편집에서 사용하며 Page간 통신을 위해 Context를 사용함.
};

/*	selectType='tab'
		Tab 등에서 사용하는 형태로, 한번 Select가 되면 스스로 OFF가 안되는 경우임 (즉 Toggle을 못하는 경우임)
		'disabled'상태를 Selected로 사용하고, Disabled이미지를 Hover, Down에 사용함. (단 Hover가 주어지면 그것을 사용함. 이러한 형태의 Tab도 가능함)
		Group Toggle 기능이 가능함
	selectType='toggle'
		Toggle 형태의 버튼임
		'disabled'상태를 Selected로 사용하고 disabledDown, disabledHover를 사용함
	selectType='check'
		Toggle의 경우, check이 되면 다시 돌아가지 못하지만,
		이것은 on/off check를 지원함
	selectType='simple';
		Disabled 상태를 쓰지 않는 것만 다름
*/
xa.onEdit = apn.widgets['apn.wgt.rect'].onEdit;

xa.exeCreateTag = function(viewer, canvas, objData, zx, zy, oId)/*Element*/
{
	var tag = apn.widgets['apn.wgt.rect'].exeCreateTag.call(this, viewer, canvas, objData, zx, zy, oId);

	tag.apnTapCsr = true; // Tap에 Interaction이 이미 있는 것과 같은 상태로 지정함. Cursor 처리를 위한 것임

	return tag;
}

xa.exeAssetPreload = function(apx, oId, onEnd)
{
	var cfg = apx.wgtGetProperty(oId, 'cfg');

	var imgs = {}, cnt = 0;

	for(var i in cfg.images){
		if (cfg.images[i].mediaID){
			imgs[i] = {url:apx.mediaURL(cfg.images[i].mediaID)};
			cnt ++;
		}
	}

	if (cnt){
		function onLoad(cntAll, cntSucc, cntErr)
		{
			onEnd();
		}
		new apn.CRscLoader().load(apx.project, imgs, onLoad);
	}
	else{
		onEnd();
	}
}

xa.exeOnLoad = function(apx, oId)
{
	var _this = this;
	var tag = apx.wgtTag(oId);

	function displayHover()
	{
		//	위젯간 SYNC에 의한 삭제 후 호출 가능성
		if (!apx.wgtTag(oId)) return;

		var state = 'hover';

		if (selectType == 'toggle'){
			if (apx.wgtGetProperty(oId, 'apxState') == 'disabled') state = 'disabledHover';
		}
		else if (selectType == 'check'){
			if (apx.wgtGetProperty(oId, 'apxState') == 'checked') state = 'checkedH';
		}
		else{
			if (apx.wgtGetProperty(oId, 'apxState') == 'disabled') return;
		}

		if (tag._images[state].mediaID) _this.exeAssetLoad(apx, tag, tag._images[state].mediaID);
		uxWgtBtnImage.setTextColor(apx, oId, state);
		if (_this.I_exeOnStateChange) _this.I_exeOnStateChange(apx, oId, state);
	}
	
	function displayOut()
	{
		//	위젯간 SYNC에 의한 삭제 후 호출 가능성
		if (!apx.wgtTag(oId)) return;

		if (tag._down){
			if (selectType == 'check'){
				var state = 'checkedD';
			}
			else{
				var state = 'down';
			}
		}
		else{
			var state = apx.wgtGetProperty(oId, 'apxState');
		}

		if (tag._images[state].mediaID) _this.exeAssetLoad(apx, tag, tag._images[state].mediaID);
		uxWgtBtnImage.setTextColor(apx, oId, state);
		if (_this.I_exeOnStateChange) _this.I_exeOnStateChange(apx, oId, state);
	}
	
	function displayPressed()
	{
		//	위젯간 SYNC에 의한 삭제 후 호출 가능성
		if (!apx.wgtTag(oId)) return;

		var state = 'down';

		if (selectType == 'toggle'){
			if (apx.wgtGetProperty(oId, 'apxState') == 'disabled') state = 'disabledDown';
		}
		else if (selectType == 'check'){
			//if (apx.wgtGetProperty(oId, 'apxState') == 'checked') state = 'checkedD';
		}
		else{
			if (apx.wgtGetProperty(oId, 'apxState') == 'disabled') return;
		}
		
		if (tag._images[state].mediaID) _this.exeAssetLoad(apx, tag, tag._images[state].mediaID);
		uxWgtBtnImage.setTextColor(apx, oId, state);
		if (_this.I_exeOnStateChange) _this.I_exeOnStateChange(apx, oId, state);
	}

	function displayNormal()
	{
		var state = apx.wgtGetProperty(oId, 'apxState');

		if (!tag._images[state]) state = 'normal'; // 하위 Class에서 Button의 상태외에 추가 상태를 사용하는 경우를 위해서, 모르는 State는 'normal'로 표시함

		if (tag._images[state].mediaID) _this.exeAssetLoad(apx, tag, tag._images[state].mediaID);
		uxWgtBtnImage.setTextColor(apx, oId, state);
		if (_this.I_exeOnStateChange) _this.I_exeOnStateChange(apx, oId, state);
	}

	var cfg = apx.wgtGetProperty(oId, 'cfg');
	var selectType = apx.wgtGetProperty(oId, 'selectType');

	var canHoverOut; // Hover sync 동작을 위해서 정의함
	var canPressed;

	//	ToopTip
	if (cfg.ttip){
		tag.title = cfg.ttip;
	}

	//	구버전
	if (!cfg.images.disabledDown) cfg.images.disabledDown = {mediaID:undefined};
	if (!cfg.images.disabledHover) cfg.images.disabledHover = {mediaID:undefined};
	if (!cfg.clr) cfg.clr = {disabled:null, down:null, hover:null};

	if (this.I_exeOnLoad_check && !this.I_exeOnLoad_check(apx, oId)) return;

	tag._images = bx.$cloneObject({}, cfg.images);
	tag._down = false;

	//	Tap Start로 동작하는 방식
	var useTapStart = false;

	if (apn.dbUI && apn.dbUI.system && apn.dbUI.system.exeEventStart == true){
		//	Tap Start가 우선하는 파일에서 Tap Start에 반응함
		var exeProp = apn.Project.getLayout(apx.project).property.CExe;

		if (exeProp && exeProp.event && exeProp.event.TS1 == 'Y'){
			useTapStart = true;
		}
	}

	if (selectType == 'tab' || selectType == 'toggle'){
		if (selectType == 'tab'){
			tag._images.down = tag._images.disabled;
			if (!tag._images.hover.mediaID) tag._images.hover = tag._images.disabled;
		}

		tag.apxOnEvent = function(apx, ev, sX, sY)/*Boolean*/
		{
			if (ev == (useTapStart ? 'tapStart':'click')){
				if (selectType == 'toggle'){
					if (apx.wgtGetProperty(oId, 'apxState') == 'normal'){
						apx.wgtSetProperty(oId, 'apxState', 'disabled'); // Selected
					}
					else{
						apx.wgtSetProperty(oId, 'apxState', 'normal');
					}
				}
				else{
					if (apx.wgtGetProperty(oId, 'apxState') == 'normal'){
						apx.wgtSetProperty(oId, 'apxState', 'disabled'); // Selected
					}
				}
				return true;
			}
		}
	}
	else if (selectType == 'check'){
		tag.apxOnEvent = function(apx, ev, sX, sY,v,v,sysEv)/*Boolean*/
		{
			if (ev == (useTapStart ? 'tapStart':'click')){
				if (apx.wgtGetProperty(oId, 'apxState') == 'normal'){
					apx.wgtSetProperty(oId, 'apxState', 'checked'); // Selected
				}
				else{
					apx.wgtSetProperty(oId, 'apxState', 'normal'); // Unselected
				}
				return true;
			}
		}
	}

	// Down(Pressed)
	if (!useTapStart){
		if (tag._images.down.mediaID || (cfg.clr && cfg.clr.down) || tag._images.disabledDown.mediaID || (cfg.clr && cfg.clr.disabledDown)){
			canPressed = true;

			tag.btnOnDown = function(tagThis)
			{
				if (selectType == 'toggle'){
					//NO-OP
				}
				else if (selectType == 'check'){
					//NO-OP
				}
				else{
					if (apx.wgtGetProperty(oId, 'apxState') == 'disabled') return;
				}

				if (tag._down) return;

				tag._down = true;

				displayPressed();

				//	Pressed 상태를 Broadcast
				if (cfg.hvrSync){
					apx.ctxSet('uxWgtBtnImage_'+cfg.hvrSync, {oId:oId,state:/*pressed*/2});
				}
			}
		}
	}

	tag.btnOnState = function(tagThis)
	{
		displayNormal();
	}

	if (!useTapStart){
		if (tag._images.hover.mediaID || (cfg.clr && cfg.clr.hover) || tag._images.disabledHover.mediaID || (cfg.clr && cfg.clr.disabledHover) || (cfg.clr && cfg.clr.checkedH)){
			canHoverOut = true;
			
			if (!bx.HCL.DV.hasTouchEvent()){ // Mouse/Touch 이중으로 Event가 오는 기기에서 오동작 방지
				/*	%%INFO
					MouseMove의 처리에서 IE/Chrome이 다음과 같은 차이가 있다.
					Chrome의 경우, Tag가 움직여도 Mouse가 그대로 있으면 move가 오지 않지만
					IE는 move가 온다.
					이것으로 인하여 미세한 동작 차이가 발생하지만, 일단 이러한 차이는 무시하기로 한다
				*/
				tag.onmousemove = function(ev)
				{
					//	Pass면 처리하지 않음
					if (tag.apnPassPointerEvent) return false;
					if (tag.apnBlockPointerEvent) return false;

					if (tag._down) return;

					displayHover();

					//	Hover 상태를 Broadcast
					if (cfg.hvrSync){
						if (!tag._btnHover){
							tag._btnHover = true;
							apx.ctxSet('uxWgtBtnImage_'+cfg.hvrSync, {oId:oId,state:/*hover*/1});
						}
					}
				}

				tag.onmouseout = function(ev)
				{
					//	Pass면 처리하지 않음
					if (tag.apnPassPointerEvent) return false;
					if (tag.apnBlockPointerEvent) return false;

					displayOut();

					//	Out 상태를 Broadcast
					if (cfg.hvrSync){
						if (tag._btnHover){
							tag._btnHover = false;

							if (!tag._down) apx.ctxSet('uxWgtBtnImage_'+cfg.hvrSync, {oId:oId,state:/*out*/0});
						}
					}
				}
			}
		}
	}

	function onBtnPressed(/*Boolean*/pressed)
	{
		if (pressed){
			if (tag.btnOnDown) tag.btnOnDown(tag);
		}
		else{
			if (tag._down){
				tag._down = false;
				
				if (tag.btnOnState) tag.btnOnState(tag);

				//	Normal 상태를 Broadcast
				if (cfg.hvrSync){
					apx.ctxSet('uxWgtBtnImage_'+cfg.hvrSync, {oId:oId, state:/*normal*/3});
				}
			}
		}
	}

	function onGestureEvent(tag, event, _void, _void, _void, _void, sysEV)
	{
		if (tag.apnBlockPointerEvent) return;

		if (event == bx.CGesture.POINTER_START){
			if (sysEV){
				if (apx.viewer.uOnGestureDragStartControl) apx.viewer.uOnGestureDragStartControl(sysEV);
			}
			onBtnPressed(true);
		}
		else if (event == bx.CGesture.POINTER_END){
			onBtnPressed(false);
		}
	}

	/*	Gesture Event Dispatch 기능을 제공하는 실행기

		실행기 Gesture와 연계하도록 하였으나, END쪽은 TAG 공간 밖에서는 신호가 잡히지 않을 수 있으므로, START쪽만 사용함
		그런데, 어차피 Pressed 동작은 중복진입 방지가 되어 있으므로,
		둘다 항상 실행 시킴
	*/
	if (apx.viewer.o.verGestureDispatch){ 
		tag.apxOnGesture = function(apx, event)
		{
			onGestureEvent(this, event);
		}
	}
	new bx.CGesture(tag, onGestureEvent, {noDelayedEvent:true, noLongholdEvent:true});

	//	상태 초기화
	if (tag.btnOnState) tag.btnOnState(tag);

	/*	버튼 그룹간 Hover/Press Sync 기능
		{oId:oId,state:0|1|2|3}
		0=out, 1=hover, 2=pressed, 3=normal
	*/
	if (cfg.hvrSync){
		function onCtxUxWgtBtnImage(ctxt)
		{
			if (ctxt && ctxt.oId != oId){
				if (canHoverOut && ctxt.state == 0){ // out
					displayOut();
				}
				else if (canHoverOut && ctxt.state == 1){ // hover
					displayHover();
				}
				else if (canPressed && ctxt.state == 2){ // pressed
					displayPressed();
				}
				else if (ctxt.state == 3){ // normal
					displayNormal();
				}
			}
		}
		apx.wgtListenContext(oId, 'uxWgtBtnImage_'+cfg.hvrSync, onCtxUxWgtBtnImage, /*always*/true);
	}

	/*	Scripting: setData, image|imageDisabled|imageSelected|imageChecked
		단, 이 위젯은 이미지의 초기 구성에 의하여 동작이 결정되므로
		이미지를 변경하는 것만 가능함
	*/
	function _errOnSetImage(warn)
	{
		if (warn){
			apx.log(oId, "Image can be set only to replace existing image. Currently, '"+warn+"' image is unset for this widget.");
		}
	}

	function onSetImage(changeWgtId, value)
	{
		if (changeWgtId == oId && value){
			var warn, applied;

			if (value.normal){
				if (tag._images.normal.mediaID){
					tag._images.normal.mediaID = value.normal;
					applied = true;
				}
				else warn = 'Normal';
			}
			if (value.pressed){
				if (tag._images.down.mediaID){
					tag._images.down.mediaID = value.pressed;
					applied = true;
				}
				else warn = 'Pressed';
			}
			if (value.hover){
				if (tag._images.hover.mediaID){
					tag._images.hover.mediaID = value.hover;
					applied = true;
				}
				else warn = 'Hover';
			}

			if (applied){
				if (tag.btnOnState) tag.btnOnState(tag);
			}

			_errOnSetImage(warn);
		}
	}
	apx.wgtListenProperty(oId, 'image', onSetImage);

	function onSetImageDisabled(changeWgtId, value)
	{
		if (changeWgtId == oId && value){
			var warn, applied;

			if (value.normal){
				if (tag._images.disabled.mediaID){
					tag._images.disabled.mediaID = value.normal;
					applied = true;
				}
				else warn = 'Disabled';
			}
			
			if (applied){
				if (tag.btnOnState) tag.btnOnState(tag);
			}

			_errOnSetImage(warn);
		}
	}
	apx.wgtListenProperty(oId, 'imageDisabled', onSetImageDisabled);

	function onSetImageChecked(changeWgtId, value)
	{
		if (changeWgtId == oId && value){
			var warn, applied;

			if (value.normal){
				if (tag._images.checked.mediaID){
					tag._images.checked.mediaID = value.normal;
					applied = true;
				}
				else warn = 'Checked';
			}
			if (value.hover){
				if (tag._images.checkedH.mediaID){
					tag._images.checkedH.mediaID = value.hover;
					applied = true;
				}
				else warn = 'Checked.hover';
			}
			
			if (applied){
				if (tag.btnOnState) tag.btnOnState(tag);
			}

			_errOnSetImage(warn);
		}
	}
	apx.wgtListenProperty(oId, 'imageChecked', onSetImageChecked);

	function onSetImageSelected(changeWgtId, value)
	{
		if (changeWgtId == oId && value){
			var warn, applied;

			if (value.normal){
				if (tag._images.disabled.mediaID){
					tag._images.disabled.mediaID = value.normal;
					applied = true;
				}
				else warn = 'Selected';
			}
			
			if (applied){
				if (tag.btnOnState) tag.btnOnState(tag);
			}

			_errOnSetImage(warn);
		}
	}
	apx.wgtListenProperty(oId, 'imageSelected', onSetImageSelected);

	//	Subclass module 초기화
	if (this.I_exeOnLoad_post) this.I_exeOnLoad_post(apx, oId);
}

xa.exeSetState = function(apx, tag, /*String*/state, /*String|undefined*/prvState)
{
	if (prvState == state) return; // 중복 호출 무시

	var selectType = apx.wgtGetProperty(apx.wgtId(tag), 'selectType');

	//	Disabled 상태 적용
	if (selectType == 'toggle' || selectType == 'check'){
		//동작없음
	}
	else{ // tab 의 경우, select는 disable과 동일한 동작이 됨
		// 'selected'의 경우, setState에서 Block 상태로 들어가고, 이 경위 ITR이 처리되지 않으므로 SetTimeout을 사용함.
		setTimeout(function(){
			if (state == 'normal'){
				if (apx.wgtGetProperty(tag.apnOID, 'apxVisibility') == 'Block' || apx.wgtGetProperty(tag.apnOID, 'apxVisibility') == 2){
					//	Block 상태
				}
				else{
					apx.tagBlockPointerEvent(tag, false);
					apn.IWidget.exeSetCursor(tag, apx.wgtGetProperty(tag.apnOID, 'apxCursor', true));
				}
			}
			else{//disabled
				apx.tagBlockPointerEvent(tag, true);
				apn.IWidget.exeSetCursor(tag, 'inherit');
//				if (tag.apxCursorBackup === undefined) tag.style.cursor = 'inherit'; // 임시로 지정된 값이므로 CSS에 직접 지정함.
//				else tag.apxCursorBackup = 'inherit';
			}
		},0);
	}

	// 상태 표시
	if (tag.btnOnState) tag.btnOnState(tag);

	var oId = apx.wgtId(tag);

	if (apx.wgtGetProperty(oId, 'uxToggleGroup')){
		//	Group에 존재하는 다른 Toggle 위젯을 찾아서 상태를 반영함.
		if (state == 'disabled' || state == 'checked'){
			function onWgt(/*ID*/i)
			{
				if (apx.wgtGetProperty(i, 'apxState') == 'on') apx.wgtSetProperty(i, 'apxState', 'off', undefined, {stateInitialize:true});
				else if (apx.wgtGetProperty(i, 'apxState') == 'disabled'/*selected*/ || apx.wgtGetProperty(i, 'apxState') == 'checked') apx.wgtSetProperty(i, 'apxState', 'normal'/*unselected*/, undefined, {stateInitialize:true});
				else if (apx.stateGetActive(i, true) == '2') {apx.stateLayerActivate(i, '1'); apx.stateSetActive(i, '1', /*stateInitialize*/true);}
			}
			apx.utlIterateInGroup(oId, 'uxToggleGroup', onWgt);
		}
	}
}

xa.exeOnScreenRefresh = apn.widgets['apn.wgt.rect'].exeOnScreenRefresh;

xa.setTextColor = function(apx, oId, state)
{
	var tag = apx.wgtTag(oId);
	var cfg = apx.wgtGetProperty(oId, 'cfg');
	var ver = apx.wgtGetProperty(oId, 'btnV');

	var hasText = apx.wgtGetProperty(oId, 'apxText') ? true : false;
	var tagText;

	if (hasText){
		tagText = tag.textTag ? tag.textTag : tag;
	}

	if (tagText && cfg.clr){
		if (state == 'normal'){
			if (tag == tagText){ // Widget Tag을 직접 변경해야 하는 경우.
				tagText.style.color = apn.Project.resolveStyle(apx.project, 'fontStyle', apx.wgtGetProperty(oId, 'apxTextColor'));
			}
			else{
				tagText.style.color = 'inherit';
			}
			if (ver == 2) tag.style.borderColor = apn.Project.resolveStyle(apx.project, 'strokeStyle', apx.wgtGetProperty(oId, 'apxStrokeStyle'));
		}
		else if (cfg.clr[state]){
			tagText.style.color = cfg.clr[state];
			if (ver == 2) tag.style.borderColor = cfg.clr[state];
		}
	}
}

xa.createAsCanvasObject = function(/*Object*/prj, /*Object*/position, /*Object*/size, /*Object|undefined*/styles, /*Object|undefined*/property)/*Object*/
{
	return apn.IWidget.createCanvasObject(prj, this, 'apn.CImage', bx.CCanvasWnd.SHAPE_RECT, position, size, styles, property);
}

xa.edtOnConfig = function(apd, objID)
{
	var cfg = apd.wgtGetProperty(objID, 'cfg');
	var local = apd.wgtGetProperty(objID, 'local');
	var selectType = apd.wgtGetProperty(objID, 'selectType');
	var tagDlg;

	// 구버전
	if (!cfg.images.disabledDown) cfg.images.disabledDown = {mediaID:undefined};
	if (!cfg.images.disabledHover) cfg.images.disabledHover = {mediaID:undefined};
	if (!cfg.clr) cfg.clr = {disabled:null, down:null, hover:null};

	var _this = this;

	function onOK()
	{
		eduLib.edtInputApplyAll(apd, tagDlg.tagSub);
		eduLib.edtInputApplyAll(apd, tagDlg.tagOrg);
		_this.edtOnSetState(apd, objID, apd.wgtGetProperty(objID, 'apxState'));

		apd.wgtSetProperty(objID, 'cfg', cfg);
		if (local){
			apd.wgtSetProperty(objID, 'local', local);

			if (_this.I_edtOnConfig_save){
				_this.I_edtOnConfig_save(apd, objID, local, tagDlg, tagDlg.tagSub, tagDlg.tagOrg);
			}
		}
		if (tagDlg._tmpSelectType) apd.wgtSetProperty(objID, 'selectType', tagDlg._tmpSelectType);
	}

	if (tagDlg = apd.dlgDoModal(700, Math.ceil(bx.UX.height*0.8), onOK)){
		tagDlg.tagSub = tagDlg.$TAG('div');
		tagDlg.tagOrg = tagDlg.$TAG('div');

		if (this.I_edtOnConfig){
			this.I_edtOnConfig(apd, objID, local, tagDlg, tagDlg.tagSub, tagDlg.tagOrg);
		}

		uxWgtBtnImage.I_edtOnConfigBuild.call(this, apd, objID, tagDlg, tagDlg.tagOrg, selectType);
	}
}

/*	Child class에서 Config 화면 재구성을 요청할 수 있도록 분리된 함수임
	selectType에 의해서 구성이 바뀌게 되며, Property에 저장된 상태가 아니므로 인수로 받아서 처리함
*/
xa.I_edtOnConfigBuild = function(apd, objID, tagParent, tagDlg, selectType)
{
	var cfg = apd.wgtGetProperty(objID, 'cfg');

	tagParent._tmpSelectType = selectType;

	var txtTitleDisabled = apn.CExe.GL({ko:'비활성 상태',en:'Disabled',ja:'非アクティブ'});
	var txtTitleNormal = apn.CExe.GL({ko:'기본 상태',en:'Normal',ja:'基本状態'});

	var label = apn.CExe.GL({ko:'버튼 상태 표시를 위한 이미지',en:'Image for each states',ja:'ボタンの状態を表示するための画像'});
	var titleNormal = txtTitleNormal;
	var titleDisabled = txtTitleDisabled;

	if (apd.wgtGetProperty(objID, 'btnV') == 2){
		var label2 = apn.CExe.GL({ko:'버튼 상태 표시를 위한 텍스트/테두리 색상',en:'Text/border color for each states',ja:'ボタンの状態を表示するためのテキスト/枠線の色'});
	}
	else{
		var label2 = apn.CExe.GL({ko:'버튼 상태 표시를 위한 텍스트 색상',en:'Text color for each states',ja:'ボタンの状態を表示するためのテキストの色'});
	}

	if (this.I_edtOnConfig_title && this.I_edtOnConfig_title(apd, objID, tagParent, 'normal')) titleNormal = this.I_edtOnConfig_title(apd, objID, tagParent, 'normal');
	if (this.I_edtOnConfig_title && this.I_edtOnConfig_title(apd, objID, tagParent, 'disabled')) titleDisabled = this.I_edtOnConfig_title(apd, objID, tagParent, 'disabled');

	if (tagDlg.eduLib) delete tagDlg.eduLib; // 기존 정보가 있으면 삭제함
	tagDlg.innerHTML = '';

	var isTextOnly = apd.wgtGetProperty(objID, 'btnType') == 'text';
	var hasText = apd.wgtGetProperty(objID, 'apxText') ? true : false;

	if (selectType == 'tab'){
		if (titleNormal == txtTitleNormal) titleNormal = apn.CExe.GL({ko:'미선택 상태',en:'Unselected',ja:'未選択の状態'});
		if (titleDisabled == txtTitleDisabled) titleDisabled = apn.CExe.GL({ko:'선택 상태',en:'Selected',ja:'選択状態'});

		if (!isTextOnly){
			eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:label});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+'', value:cfg.images, key:'normal', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+' Hover', value:cfg.images, key:'hover', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleDisabled+'', value:cfg.images, key:'disabled', join:true});
		}

		if (cfg.clr && (hasText || isTextOnly)){
			if (cfg.clr.down) cfg.clr.down = null; // 구데이터 처리
			eduLib.edtInputAdd(apd, tagDlg, {type:'space'});
			eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:label2});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleDisabled, value:cfg.clr, key:'disabled', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleNormal+' Hover', value:cfg.clr, key:'hover', join:true});
		}
	}
	else if (selectType == 'toggle'){
		if (titleDisabled == txtTitleDisabled) titleDisabled = 'Selected';

		if (!isTextOnly){
			eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:label});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleDisabled+'', value:cfg.images, key:'disabled', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleDisabled+' Hover', value:cfg.images, key:'disabledHover', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleDisabled+' Pressed', value:cfg.images, key:'disabledDown', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'space', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+'', value:cfg.images, key:'normal', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+' Hover', value:cfg.images, key:'hover', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+' Pressed', value:cfg.images, key:'down', join:true});
		}

		if (cfg.clr && (hasText || isTextOnly)){
			eduLib.edtInputAdd(apd, tagDlg, {type:'space'});
			eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:label2});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleDisabled, value:cfg.clr, key:'disabled', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleDisabled+' Hover', value:cfg.clr, key:'disabledHover', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleDisabled+' Pressed', value:cfg.clr, key:'disabledDown', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'space', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleNormal+' Hover', value:cfg.clr, key:'hover', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleNormal+' Pressed', value:cfg.clr, key:'down', join:true});
		}
	}
	else if (selectType == 'check'){
		titleNormal = apn.CExe.GL({ko:'미선택 상태',en:'Unchecked',ja:'未選択の状態'});
		var titleChecked = apn.CExe.GL({ko:'선택 상태',en:'Checked',ja:'選択状態'});

		if (!isTextOnly){
			eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:label});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleChecked+'', value:cfg.images, key:'checked', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleChecked+' Hover', value:cfg.images, key:'checkedH', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'space', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+'', value:cfg.images, key:'normal', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+' Hover', value:cfg.images, key:'hover', join:true});
		}

		if (cfg.clr && (hasText || isTextOnly)){
			eduLib.edtInputAdd(apd, tagDlg, {type:'space'});
			eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:label2});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleChecked, value:cfg.clr, key:'checked', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleChecked+' Hover', value:cfg.clr, key:'checkedH', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'space', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleNormal+' Hover', value:cfg.clr, key:'hover', join:true});
		}
	}
	else{
		if (!isTextOnly){
			eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:label});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+'', value:cfg.images, key:'normal', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+' Hover', value:cfg.images, key:'hover', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleNormal+' Pressed', value:cfg.images, key:'down', join:true});

			if (selectType != 'simple'){
				eduLib.edtInputAdd(apd, tagDlg, {type:'space', join:true});
				eduLib.edtInputAdd(apd, tagDlg, {type:'image', title:titleDisabled, value:cfg.images, key:'disabled', join:true});
			}
		}

		if (cfg.clr && (hasText || isTextOnly)){
			eduLib.edtInputAdd(apd, tagDlg, {type:'space'});
			eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:label2});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleNormal+' Hover', value:cfg.clr, key:'hover', join:true});
			eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleNormal+' Pressed', value:cfg.clr, key:'down', join:true});
			if (selectType != 'simple'){
				eduLib.edtInputAdd(apd, tagDlg, {type:'color', askUse:true, title:titleDisabled, value:cfg.clr, key:'disabled', join:true});
			}
		}

		//	Hover 상태 Sync Group - 'normal', 'simple' Select Type에서만 제공함
		eduLib.edtInputAdd(apd, tagDlg, {type:'space'});
		eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:apn.CExe.GL({ko:'버튼간 Hover/Pressed 상태 동기화',en:'Synchronize Hover/Pressed status with buttons',ja:'ボタン間Hover/Pressed状態を同期'})});
		eduLib.edtInputAdd(apd, tagDlg, {type:'text', title:apn.CExe.GL({ko:'그룹 지정',en:'Group',ja:'グループ指定'}), value:cfg, key:'hvrSync', comment:apn.CExe.GL({ko:'(편집자가 할당한 그룹ID)',en:'(Unique group ID assigned by user(editor))',ja:'（編集者が割り当てたグループID）'}), join:true});
	}

	eduLib.edtInputAdd(apd, tagDlg, {type:'space'});
	eduLib.edtInputAdd(apd, tagDlg, {type:'title', title:apn.CExe.GL({ko:'도움말(툴팁)',en:'Tooltip',ja:'ヘルプ（ツールチップ）'})});
	eduLib.edtInputAdd(apd, tagDlg, {type:'text', title:apn.CExe.GL({ko:'메시지',en:'Message',ja:'メッセージ'}), value:cfg, key:'ttip', join:true});
}

xa.edtOnSetState = function(apd, objID, state)
{
	var cfg = apd.wgtGetProperty(objID, 'cfg');

	if (cfg.images[state].mediaID) apd.wgtSetProperty(objID, 'apxMediaID', cfg.images[state].mediaID, apd.wgtGetProperty(objID, 'autoKeepSize'));
	else apd.wgtSetProperty(objID, 'apxMediaID', null);
}

xa.edtOnBuildState = function(prj, oId, pageID, ret)
{
	var cData = prj.pages[pageID].objects[oId].create.data;
	var type;

	if (cData && cData.properties && cData.properties.attrs){
		type = cData.properties.attrs.selectType;
	}

	if (type == 'tab' || type == 'toggle'){
		ret.disabled = 'Selected';
		ret.normal = 'Unselected';
	}
	else if (type == 'check'){
		ret.checked = 'Checked';
		ret.normal = 'Unchecked';
	}
	else{
		ret.normal = 'Normal';
		ret.disabled = 'Disabled';
	}
}

/*	Subclassing 지원을 위해서 다음과 같은 I/F를 제공함
	.I_edtOnConfig(apd, objID, local, tagDlg, tagLocal, tagOrg);
	.I_edtOnConfig_save(apd, objID, local, tagDlg, tagLocal, tagOrg);
	.I_edtOnConfig_title(apd, objID, tagDlg, state) // String, 각 State의 표시 이름을 가져옴
	.I_exeOnLoad_check(apx, oId)/Boolean/ // Return false이면 onLoad가 실패임
	.I_exeOnStateChange(apx, oId, state)
*/

xa.pubOnGetHTML = function(prj, pId, oId, opts)
{
	var ret = apn.IWidget.htmlRender(this, prj, pId, oId);//, undefined, {lineWidth:true, strokStyle:true});
	var html = '<div';

	ret.css += 'overflow:hidden;';

	if (ret.style.mediaID){
		ret.css += 'background-size:100% 100%;background-repeat:no-repeat;background-image: url('+apn.Project.mediaResolve(prj, ret.style.mediaID, false, true)+');';
	}

	var attr = '';
	var attrs = prj.pages[pId].objects[oId].create.data.properties.attrs;

	if (attrs.ttip){
		attr += ' title="'+apn.IWidget.exeFormatText(attrs.ttip, {xml:true,noTag:true})+'"';
	}

	html += ' style="'+ret.css+'"' + attr;
	html += ' class="apxWgt1'+(opts&&opts.addCls ? ' '+opts.addCls : '')+'"';
	if (!(opts&&opts.noId)) html += ' data-apx-id="'+oId+'">';
	else html += '>';

	/*	이 위젯은 주로 이미지로 사용되고, Text 부분이 구형 버전으로 되어 있으므로, Text set은 DOM 방식으로 하도록 함
	if (ret.style.text){}
	*/

	html += '</div>';

	return html;
}

uxWgtBtnImage = xa;
