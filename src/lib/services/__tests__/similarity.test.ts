import { SimilarityService } from '../similarity-service';

describe('SimilarityService', () => {
    let service: SimilarityService;

    beforeEach(() => {
        service = new SimilarityService();
    });

    describe('extractKeywords', () => {
        it('should extract significant keywords and ignore stopwords', () => {
            const text = "The global weather is changing very quickly in the garden";
            const keywords = service.extractKeywords(text);

            // Significant words: global, weather, changing, quickly, garden
            // Stopwords/Short: the, is, very, in
            expect(keywords.has('global')).toBe(true);
            expect(keywords.has('weather')).toBe(true);
            expect(keywords.has('garden')).toBe(true);
            expect(keywords.has('the')).toBe(false);
            expect(keywords.has('is')).toBe(false);
            expect(keywords.has('very')).toBe(false);
        });

        it('should handle punctuation correctly', () => {
            const text = "Idea, Garden! Planting... works?";
            const keywords = service.extractKeywords(text);

            expect(keywords.has('idea')).toBe(true);
            expect(keywords.has('garden')).toBe(true);
            expect(keywords.has('planting')).toBe(true);
            expect(keywords.has('works')).toBe(true);
        });
    });

    describe('calculateSimilarity', () => {
        it('should return 1.0 for identical sets', () => {
            const setA = new Set(['garden', 'planting', 'seed']);
            const setB = new Set(['garden', 'planting', 'seed']);
            expect(service.calculateSimilarity(setA, setB)).toBe(1.0);
        });

        it('should return 0.0 for completely disjoint sets', () => {
            const setA = new Set(['apple', 'orange']);
            const setB = new Set(['garden', 'seed']);
            expect(service.calculateSimilarity(setA, setB)).toBe(0);
        });

        it('should calculate Jaccard index correctly for partial matches', () => {
            // A = {garden, planting, seed}
            // B = {garden, water, moisture}
            // Intersection = {garden} (size 1)
            // Union = {garden, planting, seed, water, moisture} (size 5)
            // Jaccard = 1/5 = 0.2
            const setA = new Set(['garden', 'planting', 'seed']);
            const setB = new Set(['garden', 'water', 'moisture']);
            expect(service.calculateSimilarity(setA, setB)).toBe(0.2);
        });
    });
});
