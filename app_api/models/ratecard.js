var mongoose = require('mongoose');

var rateCardSchema = new mongoose.Schema({
    subscriptionId: {
        type: String,
        required: true
    },
    MeterId: {
        type: String,
        required: true
    },
    MeterName: String,
    MeterCategory: String,
    MeterSubCategory: String,
    MeterRegion: String,
    MeterRates: Number,
    Unit: String,
    EffectiveDate: String,
    IncludedQuantity: Number
});

mongoose.model('RateCard', rateCardSchema);
