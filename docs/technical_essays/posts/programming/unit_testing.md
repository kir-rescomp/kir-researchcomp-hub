---
date: 
  created: 2025-11-29
title: Unit Testing for Research Software - A Practical Guide
categories:
  - Programming
tags:
  - Testing
  - Python
---

<div class="dracula" markdown="1">

<p align="center">
    <img src="{{ config.site_url }}assets/images/posts/unit_testing_logo.png" alt="unit-test-logo" width="350"/>
</p>


Scientific software powers modern research, from analyzing genomic sequences to simulating climate models. Yet much of this software is written by researchers who are self-taught programmers, often under pressure to produce results quickly. Unit testing might seem like an extra burden, but it's actually a fundamental practice that makes your research more reliable, your code easier to maintain, and your findings more reproducible.

**^^What is Unit Testing?^^**

Unit testing is the practice of writing small, focused tests that verify individual components (or "units") of your code work correctly in isolation. Think of it as checking each instrument in your lab before running an experiment, rather than waiting until the end to discover something was miscalibrated.
Let's look at a concrete example from computational biology. Suppose you're writing a tool to calculate quality scores from FASTQ files—a common task when processing sequencing data:


```python
# seq_quality.py
def phred_to_prob(phred_score):
    """Convert Phred quality score to error probability."""
    return 10 ** (-phred_score / 10)

def average_quality(quality_string):
    """Calculate average Phred score from ASCII quality string."""
    if not quality_string:
        raise ValueError("Quality string cannot be empty")
    
    # FASTQ uses ASCII offset of 33
    scores = [ord(char) - 33 for char in quality_string]
    return sum(scores) / len(scores)
```
Here are the unit tests for these functions:

```python
# test_seq_quality.py
import pytest
from seq_quality import phred_to_prob, average_quality

def test_phred_conversion_perfect_quality():
    """Test Phred score of 40 (99.99% accuracy)."""
    assert abs(phred_to_prob(40) - 0.0001) < 1e-6

def test_phred_conversion_poor_quality():
    """Test Phred score of 10 (90% accuracy)."""
    assert abs(phred_to_prob(10) - 0.1) < 1e-6

def test_average_quality_uniform():
    """Test with uniform quality scores."""
    # 'III' = ASCII 73, Phred = 73-33 = 40
    result = average_quality("III")
    assert result == 40.0

def test_average_quality_mixed():
    """Test with varied quality scores."""
    # '!~' = ASCII 33 and 126, Phred 0 and 93
    result = average_quality("!~")
    assert result == 46.5

def test_average_quality_empty_string():
    """Test error handling for empty input."""
    with pytest.raises(ValueError):
        average_quality("")
```

Each test is independent, runs in milliseconds, and checks one specific behavior. If `test_phred_conversion_perfect_quality` fails, you know exactly where the problem is.

## Why Unit Testing Matters for Research Software

### Reproducibility

Research depends on reproducibility, yet computational results can be surprisingly fragile. A subtle bug in your analysis pipeline might go undetected for months, potentially affecting published results. Unit tests provide a safety net: if your tests pass, you have confidence that the core logic hasn't been accidentally broken.

### Collaboration and Reuse
Research software is increasingly collaborative. When a colleague contributes code or you return to your own code after six months, unit tests document expected behavior and catch unintended changes. They're executable documentation that never goes out of date.

### Complex Environments
If you work with HPC clusters, you know that software behavior can vary across environments—different library versions, compilers, or container configurations. Unit tests help verify that your code behaves identically whether running on your laptop, in an Apptainer container, or on a compute node with 8 GPUs.

### Confidence to Refactor
Scientific code often needs optimization. Perhaps your Python script needs to be 10x faster, or you're switching from NumPy to CuPy for GPU acceleration. Unit tests let you refactor aggressively while ensuring correctness isn't sacrificed for performance.

### Catching Edge Cases
Research data is messy. Empty files, negative values where you expected positive, Unicode characters in supposedly ASCII data—unit tests force you to think through these scenarios before they cause a job to fail after running for 48 hours on a cluster.

## Core Fundamental Rules

1. Test One Thing at a Time
Each test should verify a single, specific behavior. If a test fails, you should immediately know what went wrong without debugging.

**Good:**

```python
def test_reverse_complement_single_nucleotide():
    assert reverse_complement("A") == "T"

def test_reverse_complement_sequence():
    assert reverse_complement("ATCG") == "CGAT"
```

**Bad:**

```python
def test_reverse_complement():
    assert reverse_complement("A") == "T"
    assert reverse_complement("ATCG") == "CGAT"
    assert reverse_complement("") == ""
    # If this fails, which case broke?
```
2. Tests Must Be Independent
Tests should not depend on each other or share state. They should run successfully in any order, in parallel, or in isolation.

**Bad:**

```python
# test_analysis.py
results = None  # Shared state!

def test_load_data():
    global results
    results = load_dataset("data.csv")
    assert results is not None

def test_calculate_mean():
    # Depends on test_load_data running first!
    assert calculate_mean(results) > 0
```

3. Tests Should Be Fast
Unit tests should run in milliseconds, not minutes. If you need to test with real data files or database connections, those are integration tests—still valuable, but separate from unit tests. Fast tests mean you'll actually run them frequently.

4. Use Descriptive Names
Test names should describe what they're testing and what the expected outcome is. When a test fails in a CI/CD pipeline at 2 AM, good names are invaluable.

**Good:**

```python
def test_parse_fasta_handles_multiline_sequences()
def test_alignment_score_returns_zero_for_empty_sequences()
def test_calculate_gc_content_raises_error_on_invalid_characters()
```
**Bad:**

```python
def test1()
def test_fasta()
def test_edge_case()
```
5. Test Both Success and Failure
Don't just test the happy path. Test error conditions, edge cases, and boundary values.

```python
def test_normalize_expression_positive_values():
    """Normal case: positive expression values."""
    result = normalize([1.0, 2.0, 3.0])
    assert sum(result) == pytest.approx(1.0)

def test_normalize_expression_with_zeros():
    """Edge case: some zero values."""
    result = normalize([0.0, 1.0, 2.0])
    assert result[0] == 0.0

def test_normalize_expression_all_zeros():
    """Failure case: cannot normalize all zeros."""
    with pytest.raises(ValueError):
        normalize([0.0, 0.0, 0.0])
```
6. Avoid Testing Implementation Details
Test the public interface and behavior, not internal implementation. This gives you freedom to refactor without rewriting tests.

7. Make Failures Informative
Use assertion messages or pytest's built-in failure output to make debugging easier.

```python
def test_quality_threshold():
    reads = filter_by_quality(fastq_data, min_quality=30)
    assert len(reads) > 0, f"Expected filtered reads, got {len(reads)}"
```
## Getting Started: A Practical Guide

Installing pytest

```py
pip install pytest
```
### Writing Your First Test

Create a file starting with test_ (e.g., test_mycode.py). Write functions starting with test_:

```python
# test_mycode.py
def test_addition():
    assert 1 + 1 == 2
```
### Running Tests

```py
# Run all tests in current directory
pytest

# Run specific test file
pytest test_mycode.py

# Run tests matching a pattern
pytest -k "quality"

# Show print statements (useful for debugging)
pytest -s

# Stop at first failure
pytest -x
```

### Structuring Your Project

```py
my_project/
├── mypackage/
│   ├── __init__.py
│   ├── analysis.py
│   └── utils.py
├── tests/
│   ├── __init__.py
│   ├── test_analysis.py
│   └── test_utils.py
├── setup.py
└── README.md
```

## Common Pitfalls in Scientific Computing

##Floating Point Comparisons

Never use exact equality for floating-point numbers:

**Bad:**

```python
def test_mean():
    assert calculate_mean([1.0, 2.0, 3.0]) == 2.0
```

**Good:**

```python
def test_mean():
    assert calculate_mean([1.0, 2.0, 3.0]) == pytest.approx(2.0)
    # or
    assert abs(calculate_mean([1.0, 2.0, 3.0]) - 2.0) < 1e-10
```
### Random Number Generation

Set seeds for reproducibility:

```python
def test_random_sampling():
    import random
    random.seed(42)
    sample = random_sample(population, size=10)
    assert len(sample) == 10
```

### File I/O

Use temporary files or fixtures instead of relying on external files:

```python
import tempfile
import pytest

@pytest.fixture
def temp_fasta():
    with tempfile.NamedTemporaryFile(mode='w', suffix='.fasta', delete=False) as f:
        f.write(">seq1\nATCG\n")
        f.write(">seq2\nGCTA\n")
        return f.name

def test_parse_fasta(temp_fasta):
    sequences = parse_fasta(temp_fasta)
    assert len(sequences) == 2
```
### External Dependencies

Mock external services or databases:

```python
from unittest.mock import Mock, patch

def test_fetch_gene_info():
    with patch('mycode.ncbi_api.fetch') as mock_fetch:
        mock_fetch.return_value = {'gene': 'BRCA1', 'chromosome': 17}
        result = get_gene_location('BRCA1')
        assert result['chromosome'] == 17
```
## Final Thoughts

Unit testing isn't about achieving 100% code coverage or writing tests for the sake of writing tests. It's about building confidence in your code and making your research more reliable. Start small: pick one function that's been causing problems and write a few tests for it. Run them. See a bug get caught before it reaches production. You'll quickly see the value.
Remember, every test you write is a bug you won't have to debug at midnight before a conference deadline. Your future self—and your collaborators—will thank you.
 
- - - 
*Start with one test today. Your research deserves it.*

</div>