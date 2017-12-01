(function () {
  angular.module("mightyDatepicker", []).directive("mightyDatepicker", [
    "$compile",
    function ($compile) {
      var options, pickerTemplate;
      pickerTemplate = "<div class=\"mighty-picker__wrapper\">\n  <div class=\"button-wrapper__prev\">\n <button type=\"button\" class=\"mighty-picker__prev-month\"\n   ng-class='{\"mighty-picker__prev-month--inactive\": isButtonDisabled()}' ng-click=\"!isButtonDisabled() && moveMonth(-1, $event)\"><i class=\"zmdi zmdi-chevron-left\"></i></button>\n </div>\n <div class=\"mighty-picker__month-wrapper\">\n<div class=\"mighty-picker__month\"\n    ng-repeat=\"month in months track by $index\">\n    <div class=\"mighty-picker__month-name\" ng-bind=\"month.name\"></div>\n    <table class=\"mighty-picker-calendar\">\n      <tr class=\"mighty-picker-calendar__days\">\n        <th ng-repeat=\"day in ::month.weeks[1]\"\n          class=\"mighty-picker-calendar__weekday\">\n          {{:: day.date.format('dd') }}\n        </th>\n      </tr>\n      <tr ng-repeat=\"week in month.weeks\">\n        <td\n             ng-class='{\n              \"mighty-picker-calendar__day\": day,\n              \"mighty-picker-calendar__day--selected\": day.selected,\n \"mighty-picker-calendar__day--selected__start\": day.start,\n \"mighty-picker-calendar__day--selected__end\": day.end,\n              \"mighty-picker-calendar__day--disabled\": day.disabled,\n              \"mighty-picker-calendar__day--in-range\": day.inRange,\n              \"mighty-picker-calendar__day--marked\": day.marker,\n              \"mighty-picker-calendar__day--highlighted\": day.highlighted,\n              \"mighty-picker-calendar__day--startHover\": day.startHover,\n              \"mighty-picker-calendar__day--lastHover\": day.lastHover\n            }'\n            ng-repeat=\"day in ::week track by $index\"  ng-mouseenter=\"hover(day, $event)\" ng-mouseleave=\"unhover(day, $event)\" ng-mouseover=\"highlight(day, $event)\" ng-click=\"select(day, $event)\">\n            <div class=\"mighty-picker-calendar__day-wrapper\">\n              {{:: day.date.date() }}\n            </div>\n            <div class=\"mighty-picker-calendar__day-marker-wrapper\">\n              <div class=\"mighty-picker-calendar__day-marker\"\n                ng-if=\"day.marker\"\n                ng-bind-template=\"\">\n              </div>\n            </div>\n        </td>\n      </tr>\n    </table>\n  </div>\n  </div>\n <div class=\"button-wrapper__next\">\n <button type=\"button\" class=\"mighty-picker__next-month\"\n    ng-click=\"moveMonth(1, $event)\"><i class=\"zmdi zmdi-chevron-right\"></i></button>\n </div>\n </div>";
      options = {
        mode: "simple",
        months: 1,
        start: null,
        filter: void 0,
        callback: void 0,
        markerTemplate: "{{ day.marker }}",
        template: pickerTemplate,
        rangePicker: false,
        dateFrom: "",
        dateTo: ""
      };
      return {
        restrict: "AE",
        replace: true,
        template: '<div class="mighty-picker__holder"></div>',
        scope: {
          model: '=ngModel',
          options: '=',
          markers: '=',
          after: '=',
          before: '=',
          rangeFrom: '=',
          rangeTo: '='
        },

        link: function ($scope, $element, $attrs) {
          var _bake, _build, _buildMonth, _buildWeek, _getMarker, _indexMarkers, _indexOfMoment, _isInRange, _isSelected, _prepare, _setup, _withinLimits;
          _bake = function () {
            var domEl;
            domEl = $compile(angular.element($scope.options.template))($scope);
            return $element.append(domEl);
          };

          _indexOfMoment = function (array, element, match) {
            var key, value;
            for (key in array) {
              value = array[key];
              if (element.isSame(value, match)) {
                return key;
              }
            }
            return -1;
          };

          _indexMarkers = function () {
            var marker;
            if ($scope.markers) {
              return $scope.markerIndex = (function () {
                var _i, _len, _ref, _results;
                _ref = $scope.markers;
                _results = [];
                for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                  marker = _ref[_i];
                  _results.push(marker.day);
                }
                return _results;
              })();
            }
          };

          _withinLimits = function (day, month) {
            var withinLimits;
            withinLimits = true;
            if ($scope.before) {
              withinLimits && (withinLimits = day.isSameOrBefore($scope.before, 'day'));
            }
            if ($scope.after) {
              withinLimits && (withinLimits = day.isSameOrAfter($scope.after, 'day'));
            }
            return withinLimits;
          };

          _getMarker = function (day) {
            var ix;
            ix = _indexOfMoment($scope.markerIndex, day, 'day');
            if (ix > -1) {
              return $scope.markers[ix].marker;
            } else {
              return void 0;
            }
          };

          _isSelected = function (day) {
            switch ($scope.options.mode) {
              case "multiple":
                return _indexOfMoment($scope.model, day, 'day') > -1;
              default:
                return $scope.model && day.isSame($scope.model, 'day');
            }
          };

          _isInRange = function (day) {
            if ($scope.options.rangeMode) {
              if ($scope.options.rangeMode === "from") {
                return moment.range($scope.model, $scope.before).contains(day) || day.isSame($scope.before, 'day');
              } else {
                return moment.range($scope.after, $scope.model).contains(day) || day.isSame($scope.after, 'day');
              }
            } else if ($scope.options.rangePicker && $scope.model.length === 2) {
              return moment.range($scope.model[0], $scope.model[1]).contains(day);
            } else {
              return false;
            }
          };

          _buildWeek = function (time, month) {
            var days, filter, start;
            days = [];
            filter = true;
            start = time.startOf('week');
            days = [0, 1, 2, 3, 4, 5, 6].map(function (d) {
              var day, withinLimits, withinMonth;
              day = moment(start).add(d, 'days');
              withinMonth = day.month() === month;
              withinLimits = _withinLimits(day, month);
              afterToday = moment(day).isSame(moment(), 'day') || moment(day).isAfter(moment());
              if ($scope.options.filter) {
                filter = $scope.options.filter(day);
              }
              return {
                date: day,
                selected: _isSelected(day) && withinMonth,
                start: _isStart(day),
                end: _isEnd(day),
                inRange: _isInRange(day),
                disabled: _isBeforeFirstSelection(day) || !(withinLimits && withinMonth && filter && afterToday),
                marker: withinMonth ? _getMarker(day) : void 0,
                highlighted: false,
                startHover: false,
                lastHover: false
              };
            });
            return days;
          };

          _buildMonth = function (time) {
            var calendarEnd, calendarStart, start, w, weeks, weeksInMonth;
            weeks = [];
            calendarStart = moment(time).startOf('month');
            calendarEnd = moment(time).endOf('month');
            weeksInMonth = 5;
            start = time.startOf('month');
            weeks = (function () {
              var _i, _results;
              _results = [];
              for (w = _i = 0; 0 <= weeksInMonth ? _i <= weeksInMonth : _i >= weeksInMonth; w = 0 <= weeksInMonth ? ++_i : --_i) {
                _results.push(_buildWeek(moment(start).add(w, 'weeks'), moment(start).month()));
              }
              return _results;
            })();
            return {
              weeks: weeks,
              name: time.format("MMMM YYYY")
            };
          };

          _setup = function () {
            var attr, dates, start, tempOptions, v, _ref;
            tempOptions = {};
            for (attr in options) {
              v = options[attr];
              tempOptions[attr] = v;
            }
            if ($scope.options) {
              _ref = $scope.options;
              for (attr in _ref) {
                v = _ref[attr];
                tempOptions[attr] = $scope.options[attr];
              }
            }

            $scope.options = tempOptions;
            switch ($scope.options.mode) {
              case "multiple":
                if ($scope.model && Array.isArray($scope.model) && $scope.model.length > 0) {
                  if ($scope.model.length === 1) {
                    start = moment($scope.model[0]);
                  } else {
                    dates = $scope.model.slice(0);
                    start = moment(dates.sort().slice(-1)[0]);
                  }
                } else {
                  $scope.model = [];
                }
                break;
              default:
                if ($scope.model) {
                  start = moment($scope.model);
                }
            }

            $scope.options.start = $scope.options.start || start || moment().startOf('day');
            if ($scope.rangeFrom) {
              $scope.options.rangeMode = "from";
            } else if ($scope.rangeTo) {
              $scope.options.rangeMode = "to";
            }
            _indexMarkers();
            return $scope.options.template = $scope.options.template.replace('ng-bind-template=""', 'ng-bind-template="' + $scope.options.markerTemplate + '"');
          };

          _prepare = function () {
            var m;
            $scope.months = [];
            return $scope.months = (function () {
              var _i, _ref, _results;
              _results = [];
              for (m = _i = 0, _ref = $scope.options.months; 0 <= _ref ? _i < _ref : _i > _ref; m = 0 <= _ref ? ++_i : --_i) {
                _results.push(_buildMonth(moment($scope.options.start).add(m, 'months')));
              }
              return _results;
            })();
          };

          _build = function () {
            _prepare();
            return _bake();
          };

          $scope.moveMonth = function (step, $event) {
            if ($event != null) {
              if (typeof $event.stopPropagation === "function") {
                $event.stopPropagation();
              }
            }
            $scope.options.start.add(step, 'month');
            _prepare();
          };

          $scope.select = function (day, $event) {
            var ix;
            if ($event != null) {
              if (typeof $event.stopPropagation === "function") {
                $event.stopPropagation();
              }
            }
            if (day.disabled) {
              return;
            }
            switch ($scope.options.mode) {
              case "multiple":
                if (!day.selected) {
                  if ($scope.model.length < 2) {
                    $scope.model.push(moment(day.date));
                  } else if (moment(day.date).isAfter($scope.model[1])) {
                    $scope.model.splice(1, 1, moment(day.date));
                  } else if (moment(day.date).isBefore($scope.model[0])) {
                    $scope.model.splice(0, 1, moment(day.date));
                  } else if (moment(day.date).isBetween($scope.model[0], $scope.model[1])) {
                    $scope.model.splice(0, 2, moment(day.date));
                  }
                  if ($scope.model.length === 2 && moment($scope.model[0]).isAfter($scope.model[1])) {
                    var swap = $scope.model[0];
                    $scope.model[0] = $scope.model[1];
                    $scope.model[1] = swap;
                  }
                  if ($scope.model.length === 1 && moment(day.date).month() !== $scope.months[0].weeks[1][0].date.month()) {
                    $scope.moveMonth(1, $event);
                  }
                }
                break;
              default:
                $scope.model = day.date;
            }
            if ($scope.options.callback) {
              $scope.options.callback(day.date);
            }
            return _prepare();
          };

          $scope.highlight = function (day, $event) {
            if ($scope.model.length === 1 && !day.disabled) {
              var weeks = $scope.months[0].weeks.concat($scope.months[1].weeks);
              var days = weeks.map(function (week) {
                week.map(function (dayToCheck) {
                  _isHighlited(day, dayToCheck);
                })
              });
            }
          }

          $scope.isButtonDisabled = function () {
            var firstDayInCalendar = $scope.months[0].weeks[0][0].date;
            var currentDay = moment();
            if (currentDay.month() > firstDayInCalendar.month() && currentDay.year() >= firstDayInCalendar.year()) {              
              return true;
            } else {              
              return false;
            }
          }

          $scope.hover = function (day, $event) {
            if (!day.disabled) {
              if ($scope.model.length === 0 || $scope.model.length === 2) {
                day.startHover = true;
              } else if($scope.model.length === 1) {
                day.lastHover = true;
              }
            }
          }

          $scope.unhover = function (day, $event) {
            day.startHover = false;
            day.lastHover = false;
          }


          _isStart = function (day) {
            return moment($scope.model[0]).isSame(day, 'day') ? true : false;
          }

          _isEnd = function (day) {
            return ($scope.model.length === 2 && moment($scope.model[1]).isSame(day, 'day')) ? true : false;
          }

          _isHighlited = function (day, dayToCheck) {
            if (moment.range($scope.model[0], day.date).contains(dayToCheck.date) && !moment($scope.model[0]).isSame(dayToCheck.date, 'day') && !dayToCheck.disabled) {
              dayToCheck.highlighted = true;
            } else {
              dayToCheck.highlighted = false;
            }
          }

          _isBeforeFirstSelection = function (day) {
            return $scope.model.length === 1 && !moment($scope.model[0]).isSame(day.date) && moment($scope.model[0]).isAfter(day) ? true : false;
          }

          $scope.$watchCollection('markers', function (newMarkers, oldMarkers) {
            _indexMarkers();
            return _prepare();
          });
          _setup();
          _build();
          switch ($scope.options.mode) {
            case "multiple":
              $scope.$watchCollection('model', function (newVals, oldVals) {
                return _prepare();
              });
              break;
            case "simple":
              $scope.$watch('model', function (newVal, oldVal) {
                if (!moment.isMoment(newVal)) {
                  newVal = moment(newVal);
                }
                if (!oldVal || oldVal && !newVal.isSame(oldVal, 'day')) {
                  $scope.model = newVal;
                  if (oldVal) {
                    $scope.options.start = moment(newVal);
                  }
                  return _prepare();
                }
              });
          }
          $scope.$watch('before', function (newVal, oldVal) {
            if (newVal) {
              if (!moment.isMoment(newVal)) {
                newVal = moment(newVal);
              }
              if (!newVal.isSame(oldVal, 'day')) {
                return _prepare();
              }
            }
          });
          return $scope.$watch('after', function (newVal, oldVal) {
            if (newVal) {
              if (!moment.isMoment(newVal)) {
                newVal = moment(newVal);
              }
              if (!newVal.isSame(oldVal, 'day')) {
                return _prepare();
              }
            }
          });
        }
      };
    }
  ]);

}).call(this);