

let Test = React.createClass({

    render: function() {
        return <h1> 赵庆龙</h1>;
    }
});

ReactDOM.render(
    <Test/>,
    document.getElementById('setting')
);

ReactDOM.render(
    <Test/>,
    document.getElementById('action')
);

ReactDOM.render(
    <Test/>,
    document.getElementById('content')
);