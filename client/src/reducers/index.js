import { combineReducers } from 'redux';
import user from './user_reducer';
import products from './product_reducers'
import tags from './tag_reducers'
import policies from './policy_reducer';
import search from './search_reducer';
import reports from './report_reducer';
import accounts from './account_reducer';
import messages from './message_reducer';
import notification from './notification_reducer';
import statistics from './statistics_reducer';

const rootReducer = combineReducers({
    user,
    products,
    tags,
    policies,
    search,
    reports,
    accounts,
    messages,
    notification,
    statistics,
});

export default rootReducer;