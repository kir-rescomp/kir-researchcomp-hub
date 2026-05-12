# Finding Job Efficiency


<div class="nord" markdown=1>

```py
$ efficiency 18817817

Job Efficiency Report
Cluster: cluster
Job ID: 18817817
User: mat611
State: COMPLETED
Cores: 2
Tasks: 1
Nodes: 1

Job Wall-time:
  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   2.7% 00:00:16 of 00:10:00 time limit
CPU Efficiency:
  ████████████░░░░░░░░░░░░░░░░░░  40.6% 00:00:13 of 00:00:32 core-walltime
Memory Efficiency:
  ███████████████████████░░░░░░░  77.9% 9.35 GB of 12.0 GB

Recommendations:
• CPU efficiency is low. Consider reducing core count or optimizing code.
• Job finished early. Consider reducing time limit.
```
</div>