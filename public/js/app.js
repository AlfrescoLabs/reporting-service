var Chart = require('./Chart');
var sampleData = [
  {id: '5fbmzmtc', x: 7, y: 41, z: 6},
  {id: 's4f8phwm', x: 11, y: 45, z: 9},
  // ...
];
var App = React.createClass({
  getInitialState: function() {
    return {
      data: sampleData,
      domain: {x: [0, 30], y: [0, 100]}
    };
  },

  render: function() {
    return (
      <div className="App">
        <Chart
          data={this.state.data}
          domain={this.state.domain} />
      </div>
    );
  }
});

React.renderComponent(App(), document.body);
