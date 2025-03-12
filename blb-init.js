document.addEventListener('DOMContentLoaded', function () {
    if (typeof BLB !== "undefined" && BLB.Tagger) {
        BLB.Tagger.Translation = 'KJV';
        BLB.Tagger.HyperLinks = 'all';
        BLB.Tagger.HideTanslationAbbrev = false;
        BLB.Tagger.TargetNewWindow = true;
        BLB.Tagger.NoSearchTagNames = '';
        BLB.Tagger.NoSearchClassNames = 'noTag';
    }
});
