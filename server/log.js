/*
    library to help cleanup server messages and provide a readable server log
*/

module.exports.important = function(message, size=3) {
    //logs an important message to the console, converts message to uppercase and
    //prints a border around the message.

    message = message.toUpperCase();

    let msglen = message.length;
    for(i = 0; i < size; i++) {
        if(i == 0 || i == size -1) {
            console.log("-".repeat(msglen+4));
        } else if(i == Math.floor(size / 2)) {
            console.log("| " + message + " |");
        } else {
            console.log("|" + (" ".repeat(msglen+2)) + "|");
        }
    }
}

//logs a basic message in a list format
module.exports.log = function(message) {
    console.log("\t" + message);
}

//logs content
module.exports.list = function(content) {
    console.log("LOGGING_CONTENT::START");
    if(typeof(content) != "object") {
        console.log("\t " + content);
    } else {
        content.forEach(obj => {
            this.log(Object.values(obj));
        })
    }
    console.log("LOGGING_CONTENT::END");
}