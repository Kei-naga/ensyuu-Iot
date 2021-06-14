//////////////////////////////////
// アクセストークン、スプレッドシートID、remo上のapplianceIDを事前に取得
var access_token = '***********'
var spreadsheetId = '***********'
var lightId = '***********'
/////////////////////////////////

function remo() {
  var data = getNatureRemoData();　　　　//data取得
  var lastData = getLastData();　　　　　//シートから最終date取得
  setLaremoData(
  {
    te:data[0].newest_events.te.val,　　//温度
    hu:data[0].newest_events.hu.val,　　//湿度
    il:data[0].newest_events.il.val,　　//照度
    mo:data[0].newest_events.mo.created_at,   //人感センサ
  },
  lastData.row + 1//最終data追加作業
  );
  if (data[0].newest_events.il.val > 5 && data[0].newest_events.mo.created_at == lastData.before_mo){   // 明るいかつ人いない
    postAppliancs(lightId);   //家電制御
  }
}

function getNatureRemoData() {　　　　　　//Remoのapiをお借りします
  var url = "https://api.nature.global/1/devices";
  var headers = {
    'Authorization': 'Bearer ' + access_token,
    "Content-Type" : "application/json;"
  };

  var postData = {
  };

  var options = {
    "method" : "get",
    "headers" : headers,
  };

  var data = JSON.parse(UrlFetchApp.fetch(url, options));
  Logger.log(data)
  Logger.log(data[0].newest_events)
  Logger.log(data[0].newest_events.te.val)
  Logger.log(data[0].newest_events.hu.val)
  Logger.log(data[0].newest_events.il.val)
  Logger.log(data[0].newest_events.mo.created_at)

  return data;

}

function getLastData() {
  var datas = SpreadsheetApp.openById(spreadsheetId).getSheetByName('log').getDataRange().getValues()　　//logシートをゲットする
  var data = datas[datas.length - 1]  //最後のデータ

  Logger.log(data)
  return {
    bufore_te:data[1],
    before_hu:data[2],
    before_il:data[3],
    before_mo:data[4],
    row:datas.length,
  }
}

function setLaremoData(data, row) {
  SpreadsheetApp.openById(spreadsheetId).getSheetByName('log').getRange(row, 1).setValue(Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd hh:mm'))//A2にゲットした日時ほりこむ
  SpreadsheetApp.openById(spreadsheetId).getSheetByName('log').getRange(row, 2).setValue(data.te)　　//B2に温度追加
  SpreadsheetApp.openById(spreadsheetId).getSheetByName('log').getRange(row, 3).setValue(data.hu)　　//C2湿度追加(幅があるけど気にしない)
  SpreadsheetApp.openById(spreadsheetId).getSheetByName('log').getRange(row, 4).setValue(data.il)　　//D2照度追加
  SpreadsheetApp.openById(spreadsheetId).getSheetByName('log').getRange(row, 5).setValue(data.mo)   //E2人感追加
}

function postAppliancs(applianceId) {
  var url = "https://api.nature.global/1/signals/" + applianceId + "/send"
  var headers = {
    'Authorization': 'Bearer ' + access_token,
  }
  var options = {
    "method" : "post",
    "headers" : headers,
  };
  UrlFetchApp.fetch(url, options)
}
