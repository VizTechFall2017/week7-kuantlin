var width = document.getElementById('svg1').clientWidth;
var height = document.getElementById('svg1').clientHeight;

var marginLeft = 100;
var marginTop = 100;

var nestedData = [];

var svg = d3.select('#svg1')
    .append('g')
    .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')');

var svg2 = d3.select('#svg2')
    .append('g')
    .attr('transform', 'translate(' + marginLeft + ',' + marginTop + ')');


//these are the size that the axes will be on the screen; set the domain values after the data loads.
var scaleX = d3.scaleBand().rangeRound([0, width-2*marginLeft]).padding(0.1);
var scaleY = d3.scaleLinear().range([height-2*marginTop, 0]);
var scaleY2 = d3.scaleLinear().range([height-2*marginTop, 0]);

//import the data from the .csv file
d3.csv('./Clean Energy.csv', function(dataIn){

    nestedData = d3.nest()
        .key(function(d){return d.year})
        .entries(dataIn);

    var loadData = nestedData.filter(function(d){return d.key == '2006'})[0].values;

    // Add the x Axis
    svg.append("g")
        .attr('class','xaxis')
        .attr('transform','translate(0,' + (height-2*marginTop) + ')')  //move the x axis from the top of the y axis to the bottom
        .call(d3.axisBottom(scaleX));

    svg.append("g")
        .attr('class', 'yaxis')
        .call(d3.axisLeft(scaleY));

    svg2.append("g")
        .attr('class','xaxis')
        .attr('transform','translate(0,' + (height-2*marginTop) + ')')  //move the x axis from the top of the y axis to the bottom
        .call(d3.axisBottom(scaleX));

    svg2.append("g")
        .attr('class', 'yaxis2')
        .call(d3.axisLeft(scaleY2));


    svg.append('text')
        .text('Clean Energy Produced by States')
        .attr('transform','translate(500, -50)')
        .style('text-anchor','middle')
        .style("font-size",'28px')
    ;


    svg.append('text')
        .text('Clean Energy Produced, in MWh')
        .attr('transform', 'translate(-30,100)rotate(270)')
        .style('text-anchor','middle')
        .style("font-size",'12px');

    svg2.append('text')
        .text('Clean Energy Over Total Energy Produced, in %')
        .attr('transform', 'translate(-30,100)rotate(270)')
        .style('text-anchor','middle')
        .style("font-size",'12px');

    $('#testCircle').tooltip();


    //bind the data to the d3 selection, but don't draw it yet
    //svg.selectAll('rect')
    //    .data(loadData, function(d){return d;});

    //call the drawPoints function below, and hand it the data2016 variable with the 2016 object array in it
    drawPoints(loadData);

});

//this function draws the actual data points as circles. It's split from the enter() command because we want to run it many times
//without adding more circles each time.
function drawPoints(pointData) {

    scaleX.domain(pointData.map(function (d) {
        return d.name;
    }));
    scaleY.domain([0, d3.max(pointData.map(function (d) {
        return +d.clean
    }))]);
    scaleY2.domain([0, d3.max(pointData.map(function (d) {
        return +d.per
    }))]);

    d3.selectAll('.xaxis')
        .call(d3.axisBottom(scaleX));

    d3.selectAll('.yaxis')
        .call(d3.axisLeft(scaleY));

    d3.selectAll('.yaxis2')
        .call(d3.axisLeft(scaleY2));

    //select all bars in SVG1, and bind them to the new data
    var rects = svg.selectAll('.bars')
        .data(pointData, function (d) {
            return d.name;
        });

    //look to see if there are any old bars that don't have keys in the new data list, and remove them.
    rects.exit()
        .remove();

    //update the properties of the remaining bars (as before)
    rects
        .transition()
        .duration(200)
        .attr('x', function (d) {
            return scaleX(d.name);
        })
        .attr('y', function (d) {
            return scaleY(d.clean);
        })
        .attr('width', function (d) {
            return scaleX.bandwidth();
        })
        .attr('height', function (d) {
            return height - 2 * marginTop - scaleY(d.clean);//400 is the beginning domain value of the y axis, set above
        })
        .attr('data-toggle', 'tooltip')
        .attr('title', function (d) {
            return d.clean;
        });

    //add the enter() function to make bars for any new countries in the list, and set their properties
    rects
        .enter()
        .append('rect')
        .attr('class', 'bars')
        .attr('id', function (d) {
            return d.name;
        })
        .attr('fill', "darkgreen")
        .attr('x', function (d) {
            return scaleX(d.name);
        })
        .attr('y', function (d) {
            return scaleY(d.clean);
        })
        .attr('width', function (d) {
            return scaleX.bandwidth();
        })
        .attr('height', function (d) {
            return height - 2 * marginTop - scaleY(d.clean);  //400 is the beginning domain value of the y axis, set above
        })
        .attr('data-toggle', 'tooltip')
        .attr('title', function (d) {
            return d.clean;
        })
        .on('mouseover', function (d) {
            d3.select(this).attr('fill', 'orange');

            currentID = d3.select(this).attr('id');
            svg2.selectAll('#' + currentID).attr('fill', 'orange')
        })
        .on('mouseout', function (d) {
            d3.select(this).attr('fill', 'darkgreen');

            currentID = d3.select(this).attr('id');
            svg2.selectAll('#' + currentID).attr('fill', 'darkgreen')
        });




    //select all bars in SVG2, and bind them to the new data
    var rects2 = svg2.selectAll('.bars')
        .data(pointData, function(d){return d.name;});

    //look to see if there are any old bars that don't have keys in the new data list, and remove them.
    rects2.exit()
        .remove();

    //update the properties of the remaining bars (as before)
    rects2
        .transition()
        .duration(200)
        .attr('x',function(d){
            return scaleX(d.name);
        })
        .attr('y',function(d){
            return scaleY2(d.per);
        })
        .attr('width',function(d){
            return scaleX.bandwidth();
        })
        .attr('height',function(d){
            return height-2*marginTop - scaleY2(d.per);  //400 is the beginning domain value of the y axis, set above
        })
        .attr('data-toggle', 'tooltip')
        .attr('title', function(d) {
            return d.per;
        });

    //add the enter() function to make bars for any new countries in the list, and set their properties
    rects2
        .enter()
        .append('rect')
        .attr('class','bars')
        .attr('id', function(d){return d.name;})
        .attr('fill', "darkgreen")
        .attr('x',function(d){
            return scaleX(d.name);
        })
        .attr('y',function(d){
            return scaleY2(d.per);
        })
        .attr('width',function(d){
            return scaleX.bandwidth();
        })
        .attr('height',function(d){
            return height-2*marginTop - scaleY2(d.per);  //400 is the beginning domain value of the y axis, set above
        })
        .attr('data-toggle', 'tooltip')
        .attr('title', function(d) {
            return d.per;
        })
        .on('mouseover', function(d){
            d3.select(this).attr('fill','orange');

            currentID = d3.select(this).attr('id');
            svg.selectAll('#' + currentID).attr('fill','orange')
        })
        .on('mouseout', function(d){
            d3.select(this).attr('fill','darkgreen');

            currentID = d3.select(this).attr('id');
            svg.selectAll('#' + currentID).attr('fill','darkgreen')
        });
    $('[data-toggle="tooltip"]').tooltip();
}


function updateData(selectedYear){
    return nestedData.filter(function(d){return d.key == selectedYear})[0].values;
}


//this function runs when the HTML slider is moved
function sliderMoved(value){

    newData = updateData(value);
    drawPoints(newData);

}