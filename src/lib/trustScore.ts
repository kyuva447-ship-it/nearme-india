export function calculateTrustScore(upvotes: number, dispute_rate: number, response_time_minutes: number, is_verified: boolean, rating: number) {
    let score = 50;
    score += Math.min(upvotes * 0.5, 20);
    score += (100 - dispute_rate) * 0.2;
    score += Math.max(0, 20 - response_time_minutes / 3);
    if (is_verified) score += 10;
    score += rating * 2;
    return Math.min(100, Math.round(score));
}

export function getTrustBadgeColor(score: number) {
    if (score >= 90) return 'text-emerald-400 border-emerald-400/50';
    if (score >= 70) return 'text-yellow-400 border-yellow-400/50';
    return 'text-gray-400 border-gray-400/50';
}
