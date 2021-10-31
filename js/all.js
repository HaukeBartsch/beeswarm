let height = 400;
let width = 1000;
let margin = ({top: 0, right: 40, bottom: 34, left: 40});

// Colors used for circles depending on continent/geography
let colors = d3.scaleOrdinal()
    .domain(["RAM-MS", "PART"])
    .range(['#D81B60','#1976D2','#388E3C','#FBC02D','#E64A19','#455A64']);

d3.select("#RAM-MS").style("color", colors("RAM-MS"));
d3.select("#PART").style("color", colors("PART"));

let svg = d3.select("#content")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

let xScale = d3.scaleTime()
    .range([margin.left, width - margin.right]);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (height - margin.bottom) + ")");

// Create line that connects node and point on X axis
let xLine = svg.append("line")
    .attr("stroke", "rgb(96,125,139)")
    .attr("stroke-dasharray", "1,2");

// Create tooltip div and make it invisible
let tooltip = d3.select("#content").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    
    // Show tooltip when hovering over circle (data for respective country)
d3.selectAll(".countries").on("mousemove", function(d) {
        tooltip.html(`Project: <strong>${d.project}</strong><br>`)
            .style('top', d3.event.pageY - 12 + 'px')
            .style('left', d3.event.pageX + 25 + 'px')
            .style("opacity", 0.9);
    
        xLine.attr("x1", d3.select(this).attr("cx"))
            .attr("y1", d3.select(this).attr("cy"))
            .attr("y2", (height - margin.bottom))
            .attr("x2",  d3.select(this).attr("cx"))
            .attr("opacity", 1);
    
}).on("mouseout", function(_) {
        tooltip.style("opacity", 0);
        xLine.attr("opacity", 0);
});  

jQuery.getJSON("data/data.json", function(data) {

    let dataSet = data;

    // Set chart domain max value to the highest total value in data set
    xScale.domain(d3.extent(data, function (d) {
        return new Date(d.date);
    }));

    projects = {};
    for (let i = 0; i < dataSet.length; i++) {
        projects[dataSet[i].project] = 1;
    }
    projects = Object.keys(projects);
    let colors = d3.scaleOrdinal()
    .domain(projects)
    .range(['#D81B60','#1976D2','#388E3C','#FBC02D','#E64A19','#455A64']);

    for (var i = 0; i < projects.length; i++) {
        d3.select("#" + projects[i]).style("color", colors(projects[i]));
    }

    redraw();


    function redraw() {

        xScale.domain(d3.extent(dataSet, function(d) {
            return new Date(d.date);
        }));

        let xAxis;
        xAxis = d3.axisBottom(xScale)
                //.tickFormat(d3.timeFormat("%Y-%m-%d"))
                .ticks(10, d3.timeFormat("%Y-%m-%d"));
                //.tickValues(data.map(function(d) { return new Date(d.date)}))
                //.tickSizeOuter(0);

        d3.transition(svg).select(".x.axis")
            .transition()
            .duration(1000)
            .call(xAxis);

        // Create simulation with specified dataset
        let simulation = d3.forceSimulation(dataSet)
            .force("x", d3.forceX(function(d) {
                return xScale(new Date(d.date));
            }).strength(2))
            .force("y", d3.forceY((height / 2) - margin.bottom / 2))
            .force("collide", d3.forceCollide(7)) // Apply collision force with radius of 7 - keeps nodes centers 7 pixels apart
            .stop(); // Stop simulation

        // Manually run simulation
        for (let i = 0; i < dataSet.length; ++i) {
            simulation.tick(10);
        }

        // Create country circles
        let countriesCircles = svg.selectAll(".countries")
            .data(dataSet, function(d) { return d.project });

        countriesCircles.exit()
            .transition()
            .duration(1000)
            .attr("cx", 0)
            .attr("cy", (height / 2) - margin.bottom / 2)
            .remove();

        countriesCircles.enter()
            .append("circle")
            .attr("class", "countries")
            .attr("cx", 0)
            .attr("cy", (height / 2) - margin.bottom / 2)
            .attr("r", 6)
            .attr("fill", function(d){ return colors(d.project)})
            .merge(countriesCircles)
            .transition()
            .duration(2000)
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        // Show tooltip when hovering over circle (data for respective country)
        d3.selectAll(".countries").on("mousemove", function(d) {
            tooltip.html(`Project: <strong>${d.project}</strong><br>`)
                .style('top', d3.event.pageY - 12 + 'px')
                .style('left', d3.event.pageX + 25 + 'px')
                .style("opacity", 0.9);

            xLine.attr("x1", d3.select(this).attr("cx"))
                .attr("y1", d3.select(this).attr("cy"))
                .attr("y2", (height - margin.bottom))
                .attr("x2",  d3.select(this).attr("cx"))
                .attr("opacity", 1);

        }).on("mouseout", function(_) {
            tooltip.style("opacity", 0);
            xLine.attr("opacity", 0);
        });
    }
})