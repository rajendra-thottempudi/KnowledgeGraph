var dom = document.getElementById('chart-container');
const contentDisplay = document.getElementById("contentDisplay");
const apiUrl = 'http://127.0.0.1:5000/getjournalpapers'; 
var myChart = echarts.init(dom, null, {
  renderer: 'canvas',
  useDirtyRect: false
});
var app = {};
var option;
//loading the data
var dataArray = [];
const uploadconfirm = document.getElementById('uploadconfirm');

const selectOption = document.getElementById("selectOption");

// Add an event listener to detect when the user selects an option



window.onload = async function() {
    try {
      // Call the fetchData function to fetch data
      const data = await fetchData();

      dataArray = data.map(row => {
            return {
                node_id: row.id, 
                node_data: {
                    author_name: row.author_name,
                    issue: row.issue,
                    journal_name: row.journal_name,
                    paper_title: row.paper_title,
                    volume: row.volume
                }
            };
        });

const authorNodesArray = [];
const uniqueAuthors = new Set();
let num = 19; // Start from 20

// Iterate through dataArray to collect unique authors and create author nodes
dataArray.forEach((item) => {
  const authorName = item.node_data.author_name;

  if (!uniqueAuthors.has(authorName)) {
    // This author is not in the authorNodesArray yet
    uniqueAuthors.add(authorName);

    // Create an author node and add it to the authorNodesArray
    const authorNode = {
      node_id: num + 1, // Start from 20
      node_data: {
        author_name: authorName,
        // Add any other data you need for author nodes
      },
    };

    authorNodesArray.push(authorNode);
    num = num + 1;
  }
});



edges_data=[]
for (let i = 0; i < dataArray.length; i++) {
  neighbors = []
  for (let j = 0; j < dataArray.length; j++) {
    if (i!=j) {
        neighbors.push('['+JSON.stringify(dataArray[j])+',' + JSON.stringify(dataArray[i]) + ']');
    }
  } 
  edges_data[i]=neighbors;
}

//for author node 20, neighbours are same_author_edges [0]
same_author_edges = [];

for (let i = 0; i < authorNodesArray.length; i++) {
  neighbors = []
  for (let j = 0; j < dataArray.length; j++) {
    if (i!=j && authorNodesArray[i].author_name == dataArray[j].author_name) {
        neighbors.push('['+ JSON.stringify(dataArray[i]) + ']');
    }
  } 
  same_author_edges[i]=neighbors;
}

selectOption.addEventListener('change', (event) => {
      let myChart = echarts.init(document.getElementById('chart-container'));
      myChart.clear();
      
      const selectedOptionValue = selectOption.value;
      
       
//loading data into nodes and edges
  const data = [];
  const edges = [];
  const newData = data.concat(authorNodesArray, dataArray);

  for (let i = 0; i < dataArray.length; i++) {
    let isFixed = false;
    let x_value = Math.random() * (myChart.getWidth()-50);
      let y_value = Math.random() * (myChart.getHeight()-50 );
    let nodeColor = '#00FF3A'; 
    let size=25;
    data.push({
        id: i,
        x: x_value,
        y: y_value,
        symbolSize: size,
        fixed: isFixed,
        label: {
            show: true,
            formatter: `${i}`,
            position: 'inside'
        },
        itemStyle: {
            color: nodeColor 
        }
    });
}

for (let i = 0; i < authorNodesArray.length; i++) {
    let isFixed = false;
    let x_value = Math.random() * (myChart.getWidth()-100);
      let y_value = Math.random() * (myChart.getHeight()-100 );
    let nodeColor = '#000000'; 
    let size=25;
    data.push({
        id: authorNodesArray[i].node_id,
        x: x_value,
        y: y_value,
        symbolSize: size,
        fixed: isFixed,
        label: {
            show: true,
            formatter: `${i}`,
            position: 'inside'
        },
        itemStyle: {
            color: nodeColor 
        }
    });
}

for (let i = 0; i < dataArray.length; i++) {
  const journalAuthor = dataArray[i].node_data.author_name;
  
  // Find the corresponding author node
  const authorNode = authorNodesArray.find(author => author.node_data.author_name === journalAuthor);

  if (authorNode) {
    // If a matching author node is found, create an edge from the author to the journal
    edges.push({
      source: authorNode.node_id.toString(), // Assuming you have an "id" property for author nodes
      target: dataArray[i].node_id, // Assuming you have an "id" property for journal nodes
      label: {
        show: false,
        fontSize: 15,
        formatter: `${authorNode.node_data.author_name}`, // Customize as needed
        color: '#000000'
      },
      itemStyle: {
        color: '#82b74b'
      },
      emphasis: {
        label: {
          show: true
        }
      }
    });
  }
}

// Add the created edges to your data
//display tooltip when user hover on nodes
  myChart.setOption({
    title: {
      top: 'bottom',
      left: 'right'
    },
    tooltip: {
      enterable: true,
      // hideDelay: 50000000,
      hideOnClick: false,
      show: true,
      formatter: function(params) {
        if (params.data.id > 19) {
          // If it's a node, show author name and journal name
          const authorNode = authorNodesArray[params.data.id-20];
          const authorName = authorNode.node_data.author_name;
          return `Author: ${authorName}`;
        } else{
          const journalNode = dataArray[params.data.id];
          const journal = journalNode.node_data.journal_name;
          const paper_title = journalNode.node_data.paper_title;
          const author = journalNode.node_data.author_name;
          return 'Author: ' +author+'<br>'+ 'Journal : ' + journal + '<br>' +'Paper Title : '+ paper_title;
        }

        return '';
      }
    },
    series: [
      {
        roam: false,
        type: 'graph',
        animation:false,
        layout:'force',
        draggable: true,
        data: data,
        force: {
                  repulsion: 100,
                  edgeLength: 200
         },
        edges: edges,
        emphasis: {
          focus: 'adjacency',
          itemStyle: {
            color: '#c94c4c', 
            borderWidth: 3 
          },
          lineStyle: {
            color: '#f00',
            width: 3 
          }
        }
      }
    ]
  });

  //display and higlight the source and target nodes when user selects the target node from dropdown
  let keepTooltipVisible = false;
  targetNode.addEventListener('change', (event) => {
    
    targetselectedNodeId = event.target.value;
    myChart.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: targetselectedNodeId
    });
    keepTooltipVisible = true;
    setTimeout(() => {
      myChart.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex: targetselectedNodeId
      });
    }, 50);

  });

});


//source dropdown
const sourceNode = document.getElementById('sourceNode');
const nodes_length=dataArray.length
    for (let i = 0; i < nodes_length; i++) {
      const option = document.createElement('option');
      option.value = i;
      option.text = `Node ${i}`;
      sourceNode.appendChild(option);
    }
    let selectedNodeId = 0;
//target dropdown
const targetNode = document.getElementById("targetNode");
for (let i = 0; i < nodes_length; i++) {
  const option = document.createElement('option');
  option.value = i;
  option.text = `Node ${i}`;
  targetNode.appendChild(option);
}

sourceNode.addEventListener('change', (event) => {
      let myChart = echarts.init(document.getElementById('chart-container'));
      myChart.clear();
      
      selectedNodeId = event.target.value;
      edges_nodes=edges_data[selectedNodeId];  
//loading data into nodes and edges
  const data = [];
  const edges = [];

  for (let i = 0; i < dataArray.length; i++) {
    let isFixed = false;
    let x_value = Math.random() * (myChart.getWidth()-50);
      let y_value = Math.random() * (myChart.getHeight()-50 );
    let nodeColor = '#034f84'; 
    let size=25;
    if (i === parseInt(selectedNodeId)) {
      console.log("Hi"); 
        isFixed = true;
        size= 30,
        x_value = myChart.getWidth() / 2;
        y_value = myChart.getHeight() / 2;
        console.log(x_value);
        console.log(y_value);
        nodeColor = '#c94c4c'; 
    }
    data.push({
        id: i,
        mutation: `${edges_nodes[i-1]}`,
        x: x_value,
        y: y_value,
        symbolSize: size,
        fixed: isFixed,
        label: {
            show: true,
            formatter: `${i}`,
            position: 'inside'
        },
        itemStyle: {
            color: nodeColor 
        }
    });
}
//edges
for (let i = 0; i < edges_nodes.length; i++) {

  if( i+1!==selectedNodeId){ 
    edges.push({ 
      source: selectedNodeId,
      target: i+1,
      label: {
        show: false,
        fontSize: 20,
        formatter: `${edges_nodes[i]}`,
        color: '#c83349' 
      },
      itemStyle: {
        color: '#82b74b' 
      },
      emphasis: {
        label: {
          show: true
        }
      } 
    });
  }
}
//display tooltip when user hover on nodes
  myChart.setOption({
    title: {
      top: 'bottom',
      left: 'right'
    },
    tooltip: {
      enterable: true,
      // hideDelay: 50000000,
      hideOnClick: false,
      show: true,
      formatter: function(params) {

        let num_selectedNodeId=parseInt(selectedNodeId);
        if((params.dataType === 'node' && params.data.id===num_selectedNodeId )){
          return 'Node : '+ selectedNodeId;
       }
       var id=params.data.id-1;
        if (params.dataType === 'node' && edges_nodes[id]!=0){
          
         var data = params.data;
        return  'Source Node : ' +selectedNodeId+'<br>'+ 'Target Node : ' + data.id + '<br>' +'Details : '+ formatString(data.mutation);
      }
      if (params.dataType === 'node'){
        var data = params.data;
       return  'Source Node : ' +selectedNodeId+'<br>'+ 'Target Node : ' + data.id + '<br>' +'Zero Mutation';
      }
    }
    },
    series: [
      {
        roam: false,
        type: 'graph',
        animation:false,
        layout:'force',
        draggable: true,
        data: data,
        force: {
                  repulsion: 100,
                  edgeLength: 200
         },
        edges: edges,
        emphasis: {
          focus: 'adjacency',
          itemStyle: {
            color: '#c94c4c', 
            borderWidth: 3 
          },
          lineStyle: {
            color: '#f00',
            width: 3 
          }
        }
      }
    ]
  });
  //display and higlight the source and target nodes when user selects the target node from dropdown
  let keepTooltipVisible = false;
  targetNode.addEventListener('change', (event) => {
    
    targetselectedNodeId = event.target.value;
    myChart.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      dataIndex: targetselectedNodeId
    });
    keepTooltipVisible = true;
    setTimeout(() => {
      myChart.dispatchAction({
        type: 'showTip',
        seriesIndex: 0,
        dataIndex: targetselectedNodeId
      });
    }, 50);

  });
 
    });
let keepTooltipVisible = true;
myChart.getZr().on('click', function() {
      if (!keepTooltipVisible) {
        myChart.dispatchAction({
          type: 'hideTip'
        });
      }
      keepTooltipVisible = false;
    });


window.addEventListener('resize', myChart.resize);


        
      // Process the fetched data
      console.log('Fetched data:', data);
    } catch (error) {
      console.error('Error:', error);
    }
}


function formatString(inputString) {
    const jsonArray = JSON.parse(inputString);

    // Convert the JSON array back to a formatted JSON string
    const jsonString = JSON.stringify(jsonArray, null, 2);
    const entries = jsonString.split('}{'); // Split the string into individual entries
    const formattedEntries = entries.map(entry => {
        const trimmedEntry = entry.trim();
        // Add line breaks between entries and format them if they are valid JSON
        if (trimmedEntry.startsWith('{') && trimmedEntry.endsWith('}')) {
            const jsonEntry = JSON.parse(trimmedEntry);
            return JSON.stringify(jsonEntry, null, 2); // Format the JSON entry with 2-space indentation
        } else {
            return trimmedEntry; // Keep non-JSON entries as is
        }
    });
    const temp =  formattedEntries.join('<br>'); // Join the formatted entries with HTML line breaks

    return temp.replace(/\n/g, '<br>');

}



async function fetchData() {
  try {
    const response = await fetch(apiUrl, {
      mode: 'cors',
      method: 'GET',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    return data; // Return the parsed JSON data
  } catch (error) {
    console.error('Error while fetching data:', error);
    return []; // Return an empty array or handle the error as needed
  }
}

