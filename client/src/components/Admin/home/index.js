import React, { Component } from 'react';
import { connect } from 'react-redux';
import Layout from '../Layout/index';
import './dashboard.scss'
import { getGrowthOfUsers, getPercentageOfAge, unusedAccountSinceBeginOfThisYear, newPostThisMonth, newAccountThisMonth, numOfAccount } from '../../../actions/statistics_action';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { UserPlus, UserExclamation , Users ,Photo , Home2, TrendingUp,TrendingDown } from 'tabler-icons-react';

class Home extends Component {

    state={
        growthOfUserData: [],
        percentageOfAge: [],
        selectedDate: new Date(),
    }

    componentDidMount(){
        this.props.dispatch(getGrowthOfUsers(this.state.selectedDate.getFullYear())).then(response => {
            console.log(response)
            this.setState({
                growthOfUserData: [{
                    id: "Users",
                    color: "hsl(280, 70%, 50%)",
                    data: response.payload
                }]
            })
        })

        this.props.dispatch(getPercentageOfAge(this.state.selectedDate.getFullYear())).then(response => {
            console.log(response)
            this.setState({
                percentageOfAge: response.payload
            })
        })
        
        this.props.dispatch(unusedAccountSinceBeginOfThisYear())
        this.props.dispatch(newAccountThisMonth(this.state.selectedDate))
        this.props.dispatch(newPostThisMonth(this.state.selectedDate))
        this.props.dispatch(numOfAccount(this.state.selectedDate))
    }

    handleDateChange = (date) =>{
        
        // console.log(typeof date);
        this.setState({selectedDate: new Date(date)},()=>{
            this.props.dispatch(getGrowthOfUsers(this.state.selectedDate.getFullYear())).then(response => {
                console.log(response)
                this.setState({
                    growthOfUserData: [{
                        id: "Users",
                        color: "hsl(280, 70%, 50%)",
                        data: response.payload
                    }]
                })
            })

            this.props.dispatch(getPercentageOfAge(this.state.selectedDate.getFullYear())).then(response => {
                console.log(response)
                this.setState({
                    percentageOfAge: response.payload
                })
            })
            
            this.props.dispatch(unusedAccountSinceBeginOfThisYear())
            this.props.dispatch(newAccountThisMonth(this.state.selectedDate))
            this.props.dispatch(newPostThisMonth(this.state.selectedDate))
            this.props.dispatch(numOfAccount(this.state.selectedDate))
        })
    }

    calculate = (a,b) => {
        if(a==0) return ((b-a)/1)*100;
        else return ((b-a)/a)*100;
    }

    render() {
        return (
           <Layout page="home">
            <div className="title">
                <div className="title-wrapper">
                    <div className="title-icon">
                        <Home2
                            size={24}
                            strokeWidth={2}
                            color={'white'}
                        />
                    </div>
                    <p>Dashboard</p>
                </div>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                        margin="normal"
                        id="date-picker-dialog"
                        label="Date picker dialog"
                        format="MM/dd/yyyy"
                        value={this.state.selectedDate}
                        onChange={this.handleDateChange}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                </MuiPickersUtilsProvider>
            </div>

            <div className="metric-wrapper">
                <div className="row no-gutters">
                    <div className="col-xl-3 no-gutters">
                        <div className="metric">
                            <UserPlus
                                size={48}
                                strokeWidth={2}
                                color={'black'}
                            />
                            <div className="content">
                                <p>New Users</p>
                                {this.props.statistics.newUsers?this.props.statistics.newUsers.usersThisMonth:"0"}
                            </div>
                            <div className="Difference">
                                {
                                    this.props.statistics.newUsers?
                                        this.props.statistics.newUsers.usersLastMonth
                                    :"0"
                                }
                                {
                                   this.props.statistics.newUsers?
                                        this.props.statistics.newUsers.usersLastMonth > this.props.statistics.newUsers.usersThisMonth ?
                                        <TrendingDown
                                            size={25}
                                            strokeWidth={2}
                                            color={'black'}
                                        /> 
                                        :
                                        <TrendingUp
                                            size={25}
                                            strokeWidth={2}
                                            color={'black'}
                                        />
                                    :"0"
                                }

                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 no-gutters">
                        <div className="metric">
                             <Photo
                                size={48}
                                strokeWidth={2}
                                color={'black'}
                            />
                            <div className="content">
                                <p>New posts</p>
                                {this.props.statistics.totalOfNewPost?this.props.statistics.totalOfNewPost.postsThisMonth:"0"}
                            </div>
                             <div className="Difference">
                                {
                                    this.props.statistics.totalOfNewPost?
                                       this.props.statistics.totalOfNewPost.postsLastMonth
                                    :"0"
                                }
                                {
                                   this.props.statistics.totalOfNewPost?
                                        this.props.statistics.totalOfNewPost.postsLastMonth > this.props.statistics.totalOfNewPost.postsThisMonth ?
                                        <TrendingDown
                                            size={25}
                                            strokeWidth={2}
                                            color={'black'}
                                        /> 
                                        :
                                        <TrendingUp
                                            size={25}
                                            strokeWidth={2}
                                            color={'black'}
                                        />
                                    :"0"
                                }

                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 no-gutters">
                        <div className="metric">
                            <Users
                                size={48}
                                strokeWidth={2}
                                color={'black'}
                            />
                            <div className="content">
                                <p>Accounts</p>
                                {this.props.statistics.sumOfUsers?this.props.statistics.sumOfUsers.cnt:"0"}
                            </div>
                            <div className="Difference">
                                {
                                    this.props.statistics.sumOfUsers?
                                        this.props.statistics.sumOfUsers.usersLastYear
                                    :"0"
                                }
                                {
                                    this.props.statistics.sumOfUsers?
                                        this.props.statistics.sumOfUsers.usersLastYear > this.props.statistics.sumOfUsers.usersThisYear ?
                                        <TrendingDown
                                            size={25}
                                            strokeWidth={2}
                                            color={'black'}
                                        /> 
                                        :
                                        <TrendingUp
                                            size={25}
                                            strokeWidth={2}
                                            color={'black'}
                                        />
                                    :"0"
                                }

                            </div>
                        </div>    
                    </div>
                    <div className="col-xl-3 no-gutters">
                        <div className="metric">
                           <UserExclamation
                                size={48}
                                strokeWidth={2}
                                color={'black'}
                            />
                            <div className="content">
                                <p>Unused Account</p>
                                {this.props.statistics.unusedUsers?this.props.statistics.unusedUsers:"0"}
                            </div>
                        </div>
                    </div>
                </div>
           </div>
           <div className="chart">
                <div className="wrapper">
                    <ResponsiveLine
                        data={this.state.growthOfUserData}
                        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                        xScale={{ type: 'point' }}
                        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false }}
                        yFormat=" >-.2r"
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            orient: 'bottom',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Growth of users',
                            legendOffset: 36,
                            legendPosition: 'middle'
                        }}
                        axisLeft={{
                            orient: 'left',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'count',
                            legendOffset: -40,
                            legendPosition: 'middle'
                        }}
                        pointSize={10}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: 'serieColor' }}
                        pointLabelYOffset={-12}
                        useMesh={true}
                        legends={[
                            {
                                anchor: 'bottom-right',
                                direction: 'column',
                                justify: false,
                                translateX: 100,
                                translateY: 0,
                                itemsSpacing: 0,
                                itemDirection: 'left-to-right',
                                itemWidth: 80,
                                itemHeight: 20,
                                itemOpacity: 0.75,
                                symbolSize: 12,
                                symbolShape: 'circle',
                                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemBackground: 'rgba(0, 0, 0, .03)',
                                            itemOpacity: 1
                                        }
                                    }
                                ]
                            }
                        ]}
                    />
                </div>
                <div className="wrapper">
                    <ResponsivePie
                    data={this.state.percentageOfAge}
                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                    startAngle={-61}
                    innerRadius={0.5}
                    padAngle={2}
                    activeOuterRadiusOffset={8}
                    colors={{ scheme: 'purple_blue' }}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{ from: 'color', modifiers: [ [ 'darker', 2 ] ] }}
                    defs={[
                        {
                            id: 'dots',
                            type: 'patternDots',
                            background: 'inherit',
                            color: 'rgba(255, 255, 255, 0.3)',
                            size: 4,
                            padding: 1,
                            stagger: true
                        },
                        {
                            id: 'lines',
                            type: 'patternLines',
                            background: 'inherit',
                            color: 'rgba(255, 255, 255, 0.3)',
                            rotation: -45,
                            lineWidth: 6,
                            spacing: 10
                        }
                    ]}
                    fill={[
                        {
                            match: {
                                id: 'ruby'
                            },
                            id: 'dots'
                        },
                        {
                            match: {
                                id: 'c'
                            },
                            id: 'dots'
                        },
                        {
                            match: {
                                id: 'go'
                            },
                            id: 'dots'
                        },
                        {
                            match: {
                                id: 'python'
                            },
                            id: 'dots'
                        },
                        {
                            match: {
                                id: 'scala'
                            },
                            id: 'lines'
                        },
                        {
                            match: {
                                id: 'lisp'
                            },
                            id: 'lines'
                        },
                        {
                            match: {
                                id: 'elixir'
                            },
                            id: 'lines'
                        },
                        {
                            match: {
                                id: 'javascript'
                            },
                            id: 'lines'
                        }
                    ]}
                    legends={[
                        {
                            anchor: 'bottom',
                            direction: 'row',
                            justify: false,
                            translateX: 0,
                            translateY: 56,
                            itemsSpacing: 0,
                            itemWidth: 100,
                            itemHeight: 18,
                            itemTextColor: '#999',
                            itemDirection: 'left-to-right',
                            itemOpacity: 1,
                            symbolSize: 18,
                            symbolShape: 'circle',
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemTextColor: '#000'
                                    }
                                }
                            ]
                        }
                    ]}
                  /> 
                </div>
            </div>
            </Layout>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
        statistics: state.statistics
    };
}

export default connect(mapStateToProps)(withRouter(Home));
