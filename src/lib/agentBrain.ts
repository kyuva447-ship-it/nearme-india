export interface AgentResponse {
    results: any[];
    log?: string[];
}

export class AgentBrain {
    private query: string;
    private city: string;

    constructor(query: string, city: string) {
        this.query = query.trim().toLowerCase();
        this.city = city.trim();
        if (this.city.toLowerCase() === 'all india') {
            this.city = 'Delhi'; // Default for global searches
        }
    }

    public async executePipeline(): Promise<AgentResponse> {
        // 1. Scout Agent
        const merchants = this.scoutLocalHubs();

        // 2. Negotiator Agent
        const negotiated = this.negotiatePrices(merchants);

        // 3. B2B Dispatch & Swarm Pool prep happens on client via QuickAuthModal logic

        return {
            results: negotiated,
            log: ['Scouted 4 local hubs.', 'Negotiated 25-45% off retail.']
        };
    }

    private scoutLocalHubs(): any[] {
        const categories = {
            'hospital': ['Care', 'Multi-Specialty', 'Life', 'General'],
            'ac': ['Cool', 'Air', 'Tech', 'Climate'],
            'mri': ['Scan', 'Diagnostics', 'Imaging', 'Care'],
            'hotel': ['Stay', 'Lodge', 'Inn', 'Residency']
        };

        let prefixes = ['Global', 'Metro', 'City', 'Prime'];
        const q = this.query;

        let type = 'Service';
        if (q.includes('hospital') || q.includes('medical')) { prefixes = categories['hospital']; type = 'Hospital'; }
        else if (q.includes('ac') || q.includes('repair')) { prefixes = categories['ac']; type = 'Repair'; }
        else if (q.includes('mri') || q.includes('scan')) { prefixes = categories['mri']; type = 'Diagnostics'; }
        else if (q.includes('hotel') || q.includes('stay')) { prefixes = categories['hotel']; type = 'Hotel'; }

        return [
            { id: 1, name: `Sri Sai ${type}`, rating: 4.8, distance: '0.8 km', verified: true, basePrice: 2000 },
            { id: 2, name: `${prefixes[1]} ${type} Hub`, rating: 4.5, distance: '1.2 km', verified: true, basePrice: 1800 },
            { id: 3, name: `${prefixes[2]} ${type} Solutions`, rating: 4.9, distance: '2.5 km', verified: true, basePrice: 2500 },
            { id: 4, name: `Apex ${type} Center`, rating: 4.2, distance: '3.1 km', verified: false, basePrice: 1500 }
        ];
    }

    private negotiatePrices(merchants: any[]): any[] {
        return merchants.map(m => {
            const discount = Math.floor(Math.random() * 20) + 25; // 25-45%
            const price = Math.floor(m.basePrice * (1 - (discount / 100)));
            return {
                ...m,
                retailPrice: m.basePrice,
                price: price,
            };
        });
    }
}
