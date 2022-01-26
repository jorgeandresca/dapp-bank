

module.exports = {
    hasValue: function (parameter) {
        if (parameter !== undefined
            && parameter !== null
            && parameter !== ""
            && parameter !== "undefined")
            return true;
        else
            return false;
    },
    hasValue_orEmptyString: function (parameter) {
        if (parameter !== undefined
            && parameter !== null)
            return true;
        else
            return false;
    },
    hasValueMany: function (parameterArray) {
        let hasValue = true;
        parameterArray.forEach(param => {
            if (!this.hasValue(param))
                hasValue = false;
        })
        return hasValue;
    },
    getCurrentHostURL(req) {
        return req.protocol + '://' + req.get('host')
    },
    log_large: function (text) {
        this.log(" ")
        this.log(" ")
        this.log(text)
        this.log(" ")
        this.log(" ")
    },
    log_medium: function (text) {
        this.log(" ")
        this.log(text)
        this.log(" ")
    },
    log: function (text) {
        // This should be the only console.log in the app. 
        // All other should be used for testing only and not pushed to git
        console.log(text);
    },
    log_event: function (array) {
        // array of arrays [[x:y]]
        let text = ">"
        array.forEach(text_arr => {
            if (this.hasValue(text_arr[1]))
                text += " " + text_arr[0] + ": " + text_arr[1] + " |"
            else if (this.hasValue(text_arr[0]))
                text += " " + text_arr[0] + " |"
        })
        text = text.substring(0, text.length - 1);
        this.log(text + "\n\n");
    },
    iterable(n) {
        const iterable_arr = []
        for (let i = 0; i < n; i++) iterable_arr.push(i);
        return iterable_arr;
    },
    format_summary(array) {
        // array of arrays [[x:y]]
        let text = ""
        array.forEach(text_arr => {
            if (this.hasValue(text_arr[1]))
                text += "> " + text_arr[0] + ": " + text_arr[1] + " \n"
            else if (this.hasValue(text_arr[0]))
                text += "> " + text_arr[0] + " \n"
        })
        return text;
    },
    capitalizeEachWord(str) {
        var splitStr = str.toLowerCase().split(' ');
        for (var i = 0; i < splitStr.length; i++) {
            // You do not need to check if i is larger than splitStr length, as your for does that for you
            // Assign it back to the array
            splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
        }
        // Directly return the joined string
        return splitStr.join(' ');
    },
    capitalizeFirstWord(str) {
        return str.charAt(0).toUpperCase() + str.toLowerCase().slice(1);
    },
    lowerCaseFirstWord(str) {
        return str.charAt(0).toLowerCase() + str.slice(1);
    },
    thousandSeparator: function (num) {
        const separator = ",";
        num = num.toString();
        let decimals;
        if (separator == ",") {
            decimals = num.split(".")[1];
            num = num.split(".")[0]
        }
        else {
            decimals = num.split(",")[1];
            num = num.split(",")[0]
        }
        
        num = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        if (decimals == undefined)
            return num;
        else
            if (separator == ",")
                return num + "." + decimals;
            else
                return num + "," + decimals;
    },
    fixDecimals(num, decimals) {
        return parseFloat(num.toFixed(decimals));
    },
    base64_decode(base64str) {
        var bitmap = Buffer.from(base64str, 'base64');
        return bitmap;
    },
    shuffleArray(a) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    },
    getRandom(from, to) {
        return Math.floor(Math.random() * to) + from;
    },
    replaceAll(text, find, replace) {
        find = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        return text.replace(new RegExp(find, 'g'), replace);
    },
    removeEnes(word) {
        return word.replace(/ñ/g, "n").replace(/Ñ/g, "N")
    },
    removeNewLines(text) {
        return text.replace(/\r\n/g, "")
            .replace(/\n/g, "")
            .replace(/\r/g, ""); // \r \n
    },
    removeAccentMark(word) {

        return word.replace(/á/g, "a")
            .replace(/é/g, "e")
            .replace(/í/g, "i")
            .replace(/ó/g, "o")
            .replace(/ú/g, "u")
            .replace(/Á/g, "A")
            .replace(/É/g, "E")
            .replace(/Í/g, "I")
            .replace(/Ó/g, "O")
            .replace(/Ú/g, "U")
    },
    sleep: function (ms, additional_message) {
        let message = "sleeping... " + (ms / 1000) + " s.";
        if (additional_message)
            message += " - " + additional_message;
        this.log(message)
        return new Promise(resolve => setTimeout(resolve, ms));
    },
    checkEqualObjects(a, b) {
        return JSON.stringify(a) === JSON.stringify(b);
    },
    lastXminutes_date(minutes) {
        return new Date(this.getNow_date() - minutes * 60000);
    },
    lastXdays(days) {
        return new Date(this.getNow_date() - (days * (1440 * 60000)));
    },
    lastXdaysArrayStr(days) {
        const result = [];
        for (let index = 0; index < days; index++) {
            const nowDate = this.getNow_date();
            const date = new Date(nowDate - (index * (1440 * 60000)));
            result.push(this.fromDateToDateStr(date));
        }
        return result;
    },
    lastXdaysMinuxYArrayStr(days, minus) {
        const result = [];
        for (let index = minus; index < days; index++) {
            const nowDate = this.getNow_date();
            const date = new Date(nowDate - (index * (1440 * 60000)));
            result.push(this.fromDateToDateStr(date));
        }
        return result;
    },
    calculateMinutesDifference_timestamp(timestamp_before, timestamp_after) {
        // Returns the difference between 2 times in minutes
        return ((timestamp_after - timestamp_before) / 1000) / 60;
    },
    calculateMinutesDifference_date(date_before, date_after) {
        const timestamp_before = this.fromDateToTimestamp(date_before)
        const timestamp_after = this.fromDateToTimestamp(date_after)
        // Returns the difference between 2 times in minutes
        return ((timestamp_after - timestamp_before) / 1000) / 60;
    },
    calculateDaysDifference_date(date_before, date_after) {
        const diffTime = Math.abs(date_after - date_before);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    },
    calculateMonthsDifference_date(date_before, date_after) {
        let months;
        months = (date_before.getFullYear() - date_after.getFullYear()) * 12;
        months -= date_after.getMonth();
        months += date_before.getMonth();
        return months <= 0 ? 0 : months;
    },
    calculate_age_byDate(date) {
        if (!this.hasValue(date))
            return "";
        var ageDifMs = Date.now() - date.getTime();
        var ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    },
    calculate_age_byTimestamp(date_timestamp) {
        if (!this.hasValue(date_timestamp))
            return "";
        const init_date = this.fromTimestampToDate(date_timestamp)
        const ageDifMs = Date.now() - init_date.getTime();
        const ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(ageDate.getUTCFullYear() - 1970)
    },
    calculate_age_byDateStr(dateStr) {
        if (!this.hasValue(dateStr))
            return "";
        const date = this.fromDateStrToDate(dateStr);
        return this.calculate_age_byDate(date)
    },
    timezoneConvert(date, timezone) {
        // Chile: Chile/Continental
        return new Date((typeof date === "string" ? new Date(date) : date).toLocaleString("en-US", { timeZone: timezone }));
    },
    fromDateToTimestamp: function (datetime) {
        if (!this.hasValue(datetime))
            return null;
        return datetime.getTime();
    },
    fromTimestampToDateStr(timestamp) {
        if (!this.hasValue(timestamp))
            return null;
        timestamp = this.longTimestamp(timestamp)
        const date = this.fromTimestampToDate(timestamp)
        return this.fromDateToDateStr(date);
    },
    fromTimestampToDate(timestamp) {
        if (!this.hasValue(timestamp))
            return null;
        timestamp = this.longTimestamp(timestamp)
        return new Date(timestamp);
    },
    fromDateStrToDate(dateStr) {
        if (!this.hasValue(dateStr))
            return null;
        //example: "2021-05-30T00:00:00-00:00"
        const day = dateStr.split("-")[0];
        const month = dateStr.split("-")[1];
        const year = dateStr.split("-")[2];
        dateStr = year + "-" + month + "-" + day;

        const date = new Date(dateStr + "T00:00:00-00:00");

        return date;
    },
    fromDateToDateWords(date) {
        if (!this.hasValue(date))
            return null;
        const dateStr = this.fromDateToDateStr(date);
        return this.fromDateStrToDateWords(dateStr);
    },
    fromDateStrToDateWords(dateStr) {
        if (!this.hasValue(dateStr))
            return null;

        let month = parseInt(dateStr.split("-")[1]);
        if (month == 1) month = "enero";
        else if (month == 2) month = "febrero";
        else if (month == 3) month = "marzo";
        else if (month == 4) month = "abril";
        else if (month == 5) month = "mayo";
        else if (month == 6) month = "junio";
        else if (month == 7) month = "julio";
        else if (month == 8) month = "agosto";
        else if (month == 9) month = "septiembre";
        else if (month == 10) month = "octubre";
        else if (month == 11) month = "noviembre";
        else if (month == 12) month = "diciembre";

        return dateStr.split("-")[0] + "-" + month + "-" + dateStr.split("-")[2]
    },
    fromTimestampToTime: function (timestamp) {
        // expects full timestamp, with milliseconds, otherwise, x1000
        timestamp = this.longTimestamp(timestamp);
        const datetime = this.fromTimestampToDate(timestamp);

        const hour = datetime.getHours();
        const minute = datetime.getMinutes();

        return hour + ":" + minute;
    },
    fromDateToChileanTime(date) {
        date.setHours(date.getHours() - 4);
        return date;
    },
    getNow_date: function () {
        // Chile: -4
        return new Date();
    },
    getToday_timestamp: function () {
        return new Date().setHours(0, 0, 0, 0);
    },
    getToday_datetime: function () {
        return new Date(this.getToday_timestamp());
    },
    getToday_dateStr: function () {
        return this.fromDateToDateStr(this.getToday_datetime());
    },
    getCustomDate_timestamp: function (dateString) {
        /* "2020-08-29" */
        return new Date(dateString).getTime();
    },
    shortTimestamp(timestamp) {
        if (timestamp.toString().length >= 10)
            return timestamp / 1000;
        else
            return timestamp;
    },
    longTimestamp(timestamp) {
        if (timestamp.toString().length <= 10)
            return timestamp * 1000;
        else
            return timestamp;
    },
    date_resetHours: function (datetime) {
        return new Date(datetime.setHours(0, 0, 0, 0));
    },
    date_setHour: function (datetime, hour) {
        return new Date(datetime.setHours(hour, 0, 0, 0));
    },
    getYearMonth() {
        var now = new Date()

        var year = (now.getFullYear());
        var month = (now.getMonth() + 1) < 10 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1);

        return year + "_" + month;
    },
    ExcelNumberToDate(serial) {
        var utc_days = Math.floor(serial - 25569);
        var utc_value = utc_days * 86400;
        var date_info = new Date(utc_value * 1000);

        var fractional_day = serial - Math.floor(serial) + 0.0000001;

        var total_seconds = Math.floor(86400 * fractional_day);

        var seconds = total_seconds % 60;

        total_seconds -= seconds;

        var hours = Math.floor(total_seconds / (60 * 60));
        var minutes = Math.floor(total_seconds / 60) % 60;

        return new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
    },
    ExcelNumberToTimestamp(serial) {
        var utc_days = Math.floor(serial - 25569);
        var utc_value = utc_days * 86400;
        var date_info = new Date(utc_value * 1000);

        var fractional_day = serial - Math.floor(serial) + 0.0000001;

        var total_seconds = Math.floor(86400 * fractional_day);

        var seconds = total_seconds % 60;

        total_seconds -= seconds;

        var hours = Math.floor(total_seconds / (60 * 60));
        var minutes = Math.floor(total_seconds / 60) % 60;

        const date = new Date(date_info.getFullYear(), date_info.getMonth(), date_info.getDate(), hours, minutes, seconds);
        return this.fromDateToTimestamp(date)
    },
    chileTimeIsBetweenXandY() {
        const time_from = "09";
        const time_to = "22";

        const now = this.getNow_date();

        const year = now.getFullYear();
        const month = now.getMonth() + 1 < 10 ? "0" + (now.getMonth() + 1) : now.getMonth() + 1;
        const day = now.getDate() < 10 ? "0" + now.getDate() : now.getDate();

        const date = year + "-" + month + "-" + day;

        const chile_date_from = new Date(date + "T" + time_from + ":00:00-04:00"); // from X in Chile
        const chile_date_to = new Date(date + "T" + time_to + ":00:00-04:00"); // to Y in Chile

        return now > chile_date_from && now < chile_date_to;
    },
    getYearMonthDayUniqueNumber() {
        const random = parseInt(Math.random() * 1000);

        return this.getYearMonthDay_number() + "-" + random;
    },
    getYearMonthDay_number: function () {
        const now = new Date()

        const year = now.getFullYear().toString().slice(2, 4);
        const month = (now.getMonth() + 1) < 10 ? "0" + (now.getMonth() + 1) : (now.getMonth() + 1);
        const day = now.getDate() < 10 ? "0" + now.getDate() : now.getDate();

        var nowText = year.toString()
            + month.toString()
            + day.toString()

        return parseInt(nowText);
    },
    equalArrays(array1, array2) {
        return JSON.stringify(array1) == JSON.stringify(array2);
    },
    cloneObject(object) {
        return JSON.parse(JSON.stringify(object))
    }
}