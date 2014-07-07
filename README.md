# Angular based datepicker with mighty options

Builded with angularJS and momentJS.

```javascript
    angular.module("TestApp", ["mightyDatepicker"]);
    angular.module("TestApp").controller("TestCtrl", function($scope){
      _callthis = function(day) {
        console.log("call this: ", day);
      }

      _filter = function (day) {
        w = day.weekday();
        return w < 6 && w > 0;
      }

      $scope.date = null;
      $scope.options = {
        start: moment().add('month', -1),
        months: 1,
        filter: _filter,
        callback: _callback
      }

      $scope.multi = [];
      $scope.optionsM = {
        months: 3,
        mode: "multiple",
        after: moment().add('month', -3),
        before: moment().add('month', 3)
      }
    });
```

```html
<body ng-app="TestApp">
  <div ng-controller="TestCtrl">
    <div>
      <h1>Simple date picker</h1>
      <mighty-datepicker ng-model="date" options="options"></mighty-datepicker>
    </div>
    <div>
      <h1>Multiple date picker</h1>
      <mighty-datepicker ng-model="multi" options="optionsM"></mighty-datepicker>
    </div>
  </div>
</body>

```

Options for datepicker:
- start: init datepicker starting from this month
- months: number of months used in datepicker
- before: days before this date are enabled to select
- after: days after this date are enabled to select
- filter: funtion for filtering enabled dates, takes day as param, return true if day is selectable
- callback: callback parameter to fire after selecting day, takes day as parameter

To support IE8 add those polyfills:
- Array.isArray
