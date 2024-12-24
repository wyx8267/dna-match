export class DNASequenceMatcher {
    constructor(sequence) {
        this.sequence = sequence.toUpperCase();
        this.degenerateMap = {
            'A': ['A'],
            'T': ['T'],
            'C': ['C'],
            'G': ['G'],
            'N': ['A', 'T', 'C', 'G'],
            'R': ['A', 'G'],
            'Y': ['C', 'T'],
            'M': ['A', 'C'],
            'K': ['G', 'T'],
            'S': ['C', 'G'],
            'W': ['A', 'T'],
            'H': ['A', 'C', 'T'],
            'B': ['C', 'G', 'T'],
            'V': ['A', 'C', 'G'],
            'D': ['A', 'G', 'T']
        };
    }

    *searchStream(target, options = {}) {
        const {
            minMatchRate = 0.9,
            useDegenerate = false,
            startPos = 0,
            endPos = this.sequence.length,
            batchSize = 1000
        } = options;

        target = target.toUpperCase();
        
        if (!target || minMatchRate < 0 || minMatchRate > 1) {
            throw new Error('无效的参数');
        }

        const targetLength = target.length;
        let currentBatch = [];
        
        for (let pos = startPos; pos <= endPos - targetLength; pos++) {
            const segment = this.sequence.slice(pos, pos + targetLength);
            let isMatch = false;

            if (minMatchRate === 1) {
                // 完全匹配
                isMatch = this.isExactMatch(segment, target, useDegenerate);
            } else {
                // 部分匹配
                isMatch = this.checkSegmentMatch(segment, target, minMatchRate, useDegenerate);
            }

            if (isMatch) {
                const match = {
                    position: pos,
                    length: segment.length,
                    matchRate: minMatchRate === 1 ? 1 : this.calculateMatchRate(segment, target, useDegenerate)
                };
                
                currentBatch.push(match);
                
                if (currentBatch.length >= batchSize) {
                    yield currentBatch;
                    currentBatch = [];
                }
            }
        }
        
        if (currentBatch.length > 0) {
            yield currentBatch;
        }
    }

    isExactMatch(segment, target, useDegenerate) {
        for (let i = 0; i < target.length; i++) {
            if (!this.isMatch(segment[i], target[i], useDegenerate)) {
                return false;
            }
        }
        return true;
    }

    isMatch(a, b, useDegenerate) {
        if (useDegenerate) {
            return this.degenerateMap[b]?.includes(a) || this.degenerateMap[a]?.includes(b) || false;
        }
        return a === b;
    }

    checkSegmentMatch(segment, pattern, minMatchRate, useDegenerate) {
        let matches = 0;
        const length = pattern.length;
        
        for (let i = 0; i < length; i++) {
            if (this.isMatch(segment[i], pattern[i], useDegenerate)) {
                matches++;
            }
        }
        
        return matches / length >= minMatchRate;
    }

    calculateMatchRate(seq1, seq2, useDegenerate) {
        let matches = 0;
        const length = seq1.length;
        
        for (let i = 0; i < length; i++) {
            if (this.isMatch(seq1[i], seq2[i], useDegenerate)) {
                matches++;
            }
        }
        
        return matches / length;
    }

    search(target, options = {}) {
        const results = [];
        for (const batch of this.searchStream(target, options)) {
            results.push(...batch);
        }
        return results;
    }
}

// 使用示例
async function searchDNA() {
    try {
        const sequence = "ATCGNATCGATCGATATCG".repeat(25000); // 大序列，约500,000个碱基
        const target = "ATCGN";
        const matcher = new DNASequenceMatcher(sequence);

        console.time('DNA搜索');
        
        // 使用流式处理
        let matchCount = 0;
        for (const batch of matcher.searchStream(target, { batchSize: 100 })) {
            matchCount += batch.length;
            // 处理每个批次的结果
            console.log(`处理批次，包含 ${batch.length} 个匹配`);
            
            // 这里可以添加其他处理逻辑
            // 例如：将结果写入文件、发送到服务器等
        }
        
        console.timeEnd('DNA搜索');
        console.log(`总共找到 ${matchCount} 个匹配`);
        
        return matchCount;
    } catch (error) {
        console.error('搜索出错:', error);
        return 0;
    }
}

// 使用 async/await 处理流
async function processStreamWithDelay() {
    const sequence = "ATCGNATCGATCGATATCG".repeat(25000); // 大序列，约500,000个碱基
    const matcher = new DNASequenceMatcher(sequence);
    
    for await (const batch of matcher.searchStream("ATCGN", { batchSize: 100 })) {
        // 模拟异步处理每个批次
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log(`处理批次：${batch.length} 个结果`);
    }
}