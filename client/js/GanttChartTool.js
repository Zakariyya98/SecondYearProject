var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}))


var GanttSchema = new mongoose.Schema({
  start_date: String,
  text: String,
  duration: Number,
  end_date: String,
  parent: Number
});

var db = MongoDb.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'gantt-howto-node'
});

app.use("/", (req, res) => {
  res.sendFile(__dirname + "/GanttChartTool.html");
});

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.listen(port, function() {
  console.log("Server is running on port " + port + "...");
});

app.post("/start_date", "/text", "/duration", "/end_date", "/parent", (req, res) => {
  var myData = new item(req.body);
  myData.save()
    .then(item => {
      res.send("item saved to database");
    })
    .catch(err => {
      res.status(400).send("unable to save to database");
    });
});

function getTask(data) {
  return {
    text: data.text,
    start_date: data.start_date.date("YYYY-MM-DD"),
    duration: data.duration,
    progress: data.progress || 0,
    parent: data.parent
  };
}

function getLink(data) {
  return {
    source: data.source,
    target: data.target,
    type: data.type
  };
}

function sendResponse(res, action, tid, error) {

  if (action == "error")
    console.log(error);

  var result = {
    action: action
  };
  if (tid !== undefined && tid !== null)
    result.tid = tid;

  res.send(result);
}
