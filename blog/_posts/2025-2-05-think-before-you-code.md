---
title: Think Before You Code.
date: 2025-2-05
tags:
  - golang
  - design
author: Ahmed Waleed
location: Dubai, UAE
---
![file.png](https://media.licdn.com/dms/image/v2/D4D12AQEX6Ym3KdJ8jQ/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1738746410551?e=1744243200&v=beta&t=Lls4fQEEEgaavcYCjmjTE1IXkRV651XsIrQ2GG14Q-s)

## Think Before You Code

It is often said that thinking about a problem makes you a better engineer. But how true is that? Taking the time to analyze a problem allows you to see the bigger picture. It helps you understand the problem from different perspectives and develop a more effective solution.

There are different scenarios where this applies, such as solving a LeetCode problem for fun, debugging an issue, or building a new feature. When developing a feature, proper design and planning are essential. Considerations include:
Defining the acceptance criteria.

- Ensuring the initial solution meets the end user's expectations.
- Designing API contracts, selecting appropriate data structures, and ensuring backward compatibility.
- Making decisions that facilitate future extensibility.

## The Rush to Code (Naïve Approach)

As programmers, we often rush into coding out of excitement or passion. Once a requirement document is ready, a story is finalized, or a brief discussion concludes, we immediately open our IDE or Vim (wink) and start coding. Early in our careers, this seems like the fastest approach, but eventually, we realize it actually slows us down. When we release to production, we encounter unexpected bugs, edge cases, and regressions, leading to multiple iterations and rewrites.

Let's consider an example to illustrate this point.

### Problem Statement

**Build a Log File Analyzer CLI tool
Requirements:**

1.  Accept a file path as input (via an argument or flag).
2.  Analyze the file and display:
    - Total number of lines.
    - Number of error messages (lines containing "ERROR").
    - Average response time if log lines contain response time data.

**Sample Log File (sample.log):**

```sh
2025-01-01 10:00:00 INFO Starting the application
2025-01-01 11:01:00 DEBUG Initializing module X
2025-01-01 12:02:00 ERROR Failed to connect to database
2025-01-01 13:03:05 INFO Application stopped
2025-01-01 14:04:00 WARN Memory usage is high
2025-01-01 15:05:00 INFO Request processed in 120 ms
2025-01-01 16:06:00 INFO Request processed in 250 ms
2025-01-01 17:07:00 INFO Request processed in 300 ms
```

A few years ago, I would have approached this problem without much thought, jumping straight into coding:

```go
// Analyze Analyze logs and return the analysis report.
// Each log entry will be tested against the provided filter.
func Analyze(f *os.File) *Matrics {
    report := &Matrics{
        ResponseTime: make([]float64, 100),
    }
    s := bufio.NewScanner(f)
    for s.Scan() {
        line := s.Text()
        logLine := strings.SplitN(line, " ", 4)
        if len(logLine) < 4 {
            continue
        }
        _, _, level, msg := logLine[0], logLine[1], logLine[2], logLine[3]

        report.TotalEntries++

        // Record the log level count.
        switch strings.ToLower(level) {
        case "info":
            report.Info++
        case "warn":
            report.Warn++
        case "error":
            report.Error++
        case "debug":
            report.Debug++
        }

        // Record the response time.
        if strings.HasSuffix(msg, "ms") {
            words := strings.Split(strings.TrimSuffix(msg, " ms"), " ")
            respTime := words[len(words)-1]
            if n, err := strconv.ParseFloat(respTime, 64); err == nil {
                report.ResponseTime = append(report.ResponseTime, float64(n))
            }
        }
    }

    return report
}

type Matrics struct {
    TotalEntries int
    Info         int
    Warn         int
    Error        int
    Debug        int
    ResponseTime []float64 // in ms
}

func (r Matrics) Print() {
    fmt.Printf("Total Log Entries: %d\n", r.TotalEntries)
    fmt.Printf("INFO: %d\n", r.Info)
    fmt.Printf("DEBUG: %d\n", r.Debug)
    fmt.Printf("WARN: %d\n", r.Warn)
    fmt.Printf("ERROR: %d\n", r.Error)
    if len(r.ResponseTime) > 0 {
        var total float64
        for _, v := range r.ResponseTime {
            total += v
        }
        avg := total / float64(len(r.ResponseTime))
        fmt.Printf("Average Response Time: %.2f ms\n", avg)
    }
}
```

While this solution works, it has several issues:

1.  The Analyze function is limited to accepting only *os.File as an input source, preventing future extensions (e.g., HTTP, RPC input sources).
2.  The Analyze function violates the Single Responsibility Principle; it handles multiple tasks, including scanning files, parsing log entries, and collecting metrics.
3.  Non-functional requirements such as handling empty files and invalid log formats are not addressed.
4.  The implementation lacks scalability for handling different input sources and varying data sizes.

## A Thoughtful Approach (Thinking Before Coding)

By applying the "Think Before You Code" principle, I could have approached the problem as follows:

### Step 1: Create a Mental Model

Before writing any code, I need to create a mental model of how the system should work. This involves:

- Understanding the input and output.
- Identifying core functionalities.
- Considering edge cases and non-functional requirements.

Let's whiteboard the problem. The following image illustrates the abstract mental model of the given problem.

![file.png](https://media.licdn.com/dms/image/v2/D4D12AQGOmOIGolU-jA/article-inline_image-shrink_1000_1488/article-inline_image-shrink_1000_1488/0/1738743759318?e=1744243200&v=beta&t=RNs6u6LPAqdljRJxz4Q7i4-BaUFasorYKkbsxr20eBA)

### Step 2: Break Down the Problem into Use Cases

Each use case should be independent and contribute to solving the problem incrementally:

1. Each use case should be independent and contribute to solving the problem incrementally:
2. Read the input source (file): validate the file format; skip invalid entries; log errors.
3. Parse the log entry: skip invalid formatted entries; choose an appropriate data structure to represent each field.
4. Analyze the log data: Apply various filters to extract relevant insights; Log a message if no relevant entries are found; Choose a suitable data structure for the report; Add parsed entries to the report;


### Step 3: Implement the Solution

- **Read Input Source**

```go
// ReadFile read given source input and valid log entries.
// Log entry not following the format will be skipped.
func ReadFile(r io.Reader) []LogEntry {
    var entries []LogEntry
    s := bufio.NewScanner(r)
    for s.Scan() {
        line := s.Text()
        entry, err := NewLogEntry(line)
        if err != nil {
            log.Println("invalid log entry: ", err)
        }
        entries = append(entries, entry)
    }
    return entries
}
```

- **Parse Log Entries**

```go
func NewLogEntry(line string) (LogEntry, error) {
    logLine := strings.SplitN(line, " ", 4)
    if len(logLine) < 4 {
        return LogEntry{}, fmt.Errorf("invalid log entry")
    }
    logDate, logTime, level, msg := logLine[0], logLine[1], logLine[2], logLine[3]
    t, err := time.Parse(time.DateTime, logDate+" "+logTime)
    if err != nil {
        return LogEntry{}, fmt.Errorf("invalid log time: %w", err)
    }
    return LogEntry{
        time:    t,
        level:   level,
        message: msg,
    }, nil
}

type LogEntry struct {
    time    time.Time
    level   string
    message string
}
```

- **Analyze the Log Data**

```go
// Analyze Analyze logs and return the analysis report.
// Each log entry will be tested against the provided filter.
func Analyze(entries []LogEntry, filter ...FilterFunc) *AnalysisReport {
	report := &AnalysisReport{
		ResponseTime: make([]float64, 100),
	}
	for _, entry := range entries {
		for _, skip := range filter {
			if skip(entry) {
				continue
			}
		}
		report.Add(entry)
	}
	return report
}

type AnalysisReport struct {
    TotalEntries int
    Info         int
    Warn         int
    Error        int
    Debug        int
    ResponseTime []float64 // in ms
}

func (report *AnalysisReport) Add(entry LogEntry) {
    report.TotalEntries++

    // Record the log level count.
    switch strings.ToLower(entry.level) {
    case LevelInfo:
        report.Info++
    case LevelWarn:
        report.Warn++
    case LevelError:
        report.Error++
    case LevelDebug:
        report.Debug++
    }

    // Record the response time.
    if strings.HasSuffix(entry.message, "ms") {
        words := strings.Split(strings.TrimSuffix(entry.message, " ms"), " ")
        respTime := words[len(words)-1]
        if n, err := strconv.ParseFloat(respTime, 64); err == nil {
            report.ResponseTime = append(report.ResponseTime, float64(n))
        }
    }
}

func (r *AnalysisReport) Print() {
    fmt.Printf("Total Log Entries: %d\n", r.TotalEntries)
    fmt.Printf("INFO: %d\n", r.Info)
    fmt.Printf("DEBUG: %d\n", r.Debug)
    fmt.Printf("WARN: %d\n", r.Warn)
    fmt.Printf("ERROR: %d\n", r.Error)
    if len(r.ResponseTime) > 0 {
        var total float64
        for _, v := range r.ResponseTime {
            total += v
        }
        avg := total / float64(len(r.ResponseTime))
        fmt.Printf("Average Response Time: %.2f ms\n", avg)
    }
}
```

Each use case is translated into smaller, modular units of code, avoiding unnecessary rewrites and iterations. By investing time in planning and designing the solution upfront, we achieve:

- Better maintainability
- Scalability
- More reliable solution

## Conclusion

Jumping into coding without fully understanding the problem never makes you an efficient programmer or a good problem solver. So, the next time you tackle a problem—pause. **Think before you code**.
For the full implementation, visit [here](https://github.com/AhmadWaleed/bites/tree/main/cmd/log-analyzer).
