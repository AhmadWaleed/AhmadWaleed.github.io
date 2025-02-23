---
title: Boost Your API Design with These Must-Know Protobuf Types.
date: 2025-2-23
tags:
  - Protobuf
  - gRPC
  - APIDesign
  - Backend
  - golang
author: Ahmed Waleed
location: Dubai, UAE
---
After using Protobuf for a few years, I’ve come across several types designed to solve specific problems. While some of these problems can be addressed without them, not knowing about these types may lead to schemas that lack robustness and fail to follow standard best practices.

This post assumes you're familiar with Protocol Buffers (protobuf). Here’s a short definition:

Protobuf is a compact, efficient, and language-neutral serialization format developed by Google. It encodes structured data into binary for fast transmission and deserialization, making it ideal for gRPC and inter-service communication.

You can find further details [here](https://protobuf.dev/).

# 1. reversed

Reversed field from a proto message definition is useful when you want to reserve its field number (and name) to prevent accidental use, This helps avoid data corruption when older and newer version of the message intract.

```protobuf
message Config {
    float64 id 1;
    string name 2;
    reserved 3; // string username 3; depcrecated in favor to use email instead
    string email 4;
}
```

In the above config message definition `reserved 3;` is used explicitly to mark this field reserve to prevent following:

- Older version of Config still expect username field reserving it will guarantee backward compatibility and avoid causing unintended behaviour. However, it is recommend to update your older client to use newer version.
- Ensure newer version do no interpret old serialized data.
- Avoid accidental result that might lead to type mismatches or unexpected values.

# 2. oneof

In Protocol Buffers (protobuf), oneof allows defining multiple fields where only one can be set at a time, ensuring mutual exclusivity and saving space.
It’s similar to an interface in programming—allowing multiple types but holding only one concrete implementation at a time.

```protobuf
message TimePeriod {
  oneof time {
    // Time in <int><unit> form ("s", "m", "h", "d", "mo")
    // "d" = 24 hours, "mo" = 30 days
    string duration = 1;

    // Time in seconds
    int64 seconds = 2;
  }
}
```
```go
// Example usage in Golang.
p := &TimePeriod{
    Duration: "5d",  // Setting duration in days
    Seconds:  432000, // Equivalent duration in seconds
}
```

In above example TimePeriod message uses oneof to represent a duration in either a human-readable string format (e.g., "5d") or as an exact number of seconds (int64). This ensures that only one representation is set at a time, preventing inconsistencies while offering flexibility in time specification.

Consider TimePeriod message definition without a oneof:

```protobuf
message TimePeriod {
  string duration = 1; // Duration in <int><unit> form, like "5d"
  int64 seconds = 2;   // Duration in seconds
}
```

In this case, both fields would be available independently, which might cause ambiguity or extra validation logic on the server side.

# 3. google.protobuf.Empty

google.protobuf.Empty is a special message type in Protocol Buffers (protobuf) representing an empty message. It's commonly used when an API method doesn't require input or output data but still needs to adhere to the message format.

This is similar to handling HTTP requests where no response is needed, and status 201 (No Content) is returned. In protobuf, instead of defining a response type with no fields, you can return google.protobuf.Empty

```protobuf
import "google/protobuf/empty.proto";

service ConfigService {
  rpc Reload(google.protobuf.Empty) returns (google.protobuf.Empty);
}
```

# 4. google.type.DayOfWeek

`google.type.DayOfWeek` is an enumeration in Protocol Buffers (protobuf) representing the days of the week. It provides a standard way to refer to days, ensuring consistency across APIs in different services.

Here’s how you might use DayOfWeek in your protobuf schema to represent the day for a config reload:

```protobuf
import "google/type/dayofweek.proto";

// TimeOfDay represents the time when the config can be reloaded.
message TimeOfDay {
  // The day of the week the time applies to.
  google.type.DayOfWeek day = 1;

  TimePeriod time = 2; // Time at which the config auto-reloads
}
```

The DayOfWeek enum ensures that the day field in the TimeOfDay message is set to a valid day, helping to specify the exact day and time period for the config to reload.

# 5. google.protobuf.FieldMask

`google.protobuf.FieldMask` is a special message type in Protocol Buffers (protobuf) that allows specifying which fields of a message should be included or excluded in operations like updates or partial responses.

It’s commonly used when you want to send or update only a subset of fields from a message, rather than the entire message. For example, in an update operation, you may want to modify only specific fields in an entity, leaving others unchanged.

```protobuf
import "google/protobuf/field_mask.proto";

import "google/protobuf/empty.proto";

service ConfigService {
  rpc Update(UpdateConfigRequest) returns (google.protobuf.Empty);
}

message UpdateConfigRequest {
    int64 id 1; // The ID of the config to be updated.
    Config config = 2; // The data for the configuration fields to be updated.
    google.protobuf.FieldMask update_mask = 3; // A FieldMask specifying which fields in config should be updated.
}
```

Here’s a partial implementation of `ConfigService.Update`, demonstrating how to handle field updates.

```go
// Example usage in Golang.
func(svc *ConfigServer) Update(req *pb.UpdateConfigRequest) (*pb.Empty, error) {
    cfg, _ := svc.repo.FindConfig(req.GetId())

    for _, path := range req.GetUpdateMask().GetPaths() {
    switch path {
    case "config.name":
        cfg.Name = req.GetConfig().GetName()
    case "config.value":
        cfg.Value = req.GetConfig().GetValue()
    case "config.status":
        cfg.Status = req.GetConfig().GetStatus()
        // ...
    }

    _ = svc.repo.SaveConfig(cfg)

    return &pb.Empty{}, nil
}
```

# Summary

In this post, we touched on just a few of the many useful types available in Protocol Buffers (protobuf).
We explored `reserved`, `oneof`, `google.protobuf.Empty`, `google.type.DayOfWeek`, and `google.protobuf.FieldMask`, discussing how they help improve schema design and API interactions. However, there are many more protobuf types to explore—diving deeper can help you build even more flexible, efficient, and maintainable APIs
