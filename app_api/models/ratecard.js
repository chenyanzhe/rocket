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

rateCardSchema.index({ subscriptionId: 1, MeterId: 1 });

mongoose.model('RateCard', rateCardSchema);
