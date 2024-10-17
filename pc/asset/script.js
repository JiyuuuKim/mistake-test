apx.addEventListener("pageBubble", function (Event, ctx) {
  with (ctx) {
    // Page Craete
    var onPageCreate = function () {
      onCustomProgressBar();
    };

    // Page Run
    var onPageRun = function () {
      set("@types", {
        명료: 0,
        적극: 0,
        유연: 0,
        신중: 0,
        온화: 0,
      });
    };

    // 답 선택
    var onClickButton = function () {
      var label = Event.target.get("label");
      var targetType = label.split("_")[1];
      targetType.split(",").forEach(function (type) {
        incrementKeyValue(type);
      });
      if (
        label == "btn$q1-4_명료" ||
        label == "btn$q1-4_적극" ||
        label == "btn$q2-2_유연" ||
        label == "btn$q2-3_신중" ||
        label == "btn$q2-3_온화" ||
        label == "btn$q3-3_신중" ||
        label == "btn$q3-3_온화"
      ) {
        onComplete();
      }
    };

    // 결과 도출
    var onComplete = function () {
      var result = findMaxKey();
      var ending = $W("mlc$ending");
      var resetButton = $W("i$reset");
      // var endingProgress = document.getElementById("endingProgress");
    //   var additionalvalue = 1;
    //   var id = setInterval(frame, 100);

      $W("mlc$main").changeState("ending");
      ending.changeState(result);
      $W("mlc$progress").set("visibility", "hidden");

        $W("r$progress").sizeTo(860, 30, {timing:"linear 2000ms", onEnd:function(){
            $W("mlc$endingMsg").set("visibility", "hidden");
            ending.opacityTo(1, { timing: "ease-in-out 1000ms" });
            resetButton.opacityTo(1, { timing: "ease-in-out 1000ms" , onEnd:function(){
                resetButton.set("visibility","visible");
            }});
        }});

    //   function frame() {
    //     if (endingProgress.value < 100) {
    //       endingProgress.value = endingProgress.value + additionalvalue;
    //     } else {
    //       clearInterval(id);
    //       $W("mlc$endingMsg").set("visibility", "hidden");
    //       ending.opacityTo(1, { timing: "ease-in-out 1000ms" });
    //     }
    //   }
    };

    // 비디오 끝난 뒤
    var onEndVideo = function () {
      var split = Event.target.get("label").split("_");
      if (split[2] == 1) {
        Event.target.set("visibility", "hidden");
        $W("v$video_" + split[1] + "_2").changeState("Play");
      }
    };

    // 특정 키의 값을 +1 하는 함수
    var incrementKeyValue = function (key) {
      var object = get("@types");
      if (object && typeof object === "object" && object.hasOwnProperty(key)) {
        object[key] += 1;
      } else {
        console.log(
          "유효한 객체가 아니거나 해당 키는 객체에 존재하지 않습니다."
        );
      }
    };

    // 객체에서 최대 값을 가지는 키를 찾는 함수
    var findMaxKey = function () {
      var object = get("@types");
      var maxKey = null;
      var maxValue = -Infinity;
      for (var key in object) {
        if (object.hasOwnProperty(key)) {
          if (object[key] > maxValue) {
            maxValue = object[key];
            maxKey = key;
          }
        }
      }
      return maxKey;
    };

    // 커스텀 이벤트
    var onCustomEvent = function () {
      $W("mlc$progress").set("visibility", "visible");
      var value = Event.param.split("|")[1];
      var progress = document.getElementById("progress");
      var additionalvalue = 1;
      var id = setInterval(frame, 5);
      function frame() {
        if (progress.value < value) {
          progress.value = progress.value + additionalvalue;
        } else {
          clearInterval(id);
        }
      }
    };

    // progressBar 디자인 변경
    var onCustomProgressBar = function () {
      // main progress bar
      var css = `#progress {
        appearance: none;
        width : 100%;
        height : 100%;
        position : absolute;
      }
      #progress::-webkit-progress-bar {
        background:#e3e3e3;
        border-radius:20px;        
      }
      #progress::-webkit-progress-value {
        border-radius:20px;
        background: #ff51d5;        
      }
      `;

      // ending progress bar
      var endingCss = `#endingProgress {
        appearance: none;
        width : 100%;
        height : 100%;
        position : absolute;
      }
      #endingProgress::-webkit-progress-bar {
        background:#ea38d0;
        border-radius:0px;        
      }
      #endingProgress::-webkit-progress-value {
        border-radius:0px;
        background: #00ff5f;        
      }
      `;

      var head = document.head || document.getElementsByTagName("head")[0];
      var style = document.createElement("style");

      head.appendChild(style);

      style.type = "text/css";
      if (style.styleSheet) {
        // This is required for IE8 and below.
        style.styleSheet.cssText = css;
        style.styleSheet.cssText += endingCss;
      } else {
        style.appendChild(document.createTextNode(css));
        style.appendChild(document.createTextNode(endingCss));
      }
    };

    if (!Event.target) {
      if (Event.type == "Page Create") {
        onPageCreate();
      } else if (Event.type == "Page Run") {
        onPageRun();
      } else if (Event.type == "Custom Event") {
        onCustomEvent();
      }
    } else {
      var label = Event.target.get("label");
      if (Event.type == "Tap Start") {
        if (label.indexOf("btn$q") > -1) {
          onClickButton();
        } else if (label == "i$reset") {
          reset();
        }
      } else if (Event.type == "Media") {
        if (Event.param == "End") {
          if (label.indexOf("v$video_") > -1) {
            onEndVideo();
          }
        }
      }
    }
  }
});
